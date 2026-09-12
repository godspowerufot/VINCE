import { expect } from "chai";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

const BAT = "0x1c9049C48C24111A3546a73C67FD2A4Fc6C86Fdc";
const SPCX = "0x1d37422e15ee379549B0B8E2a47523D3Ef5071a9";
const ZERO = ethers.ZeroHash;

function proof(root: string) {
  return {
    chainKey: 3n,
    blockHeight: 25_948_522n,
    encodedTransaction: "0x1234",
    merkleProof: { root, siblings: [] as { hash: string; isLeft: boolean }[] },
    continuityProof: { lowerEndpointDigest: ZERO, roots: [] as string[] },
  };
}

async function deployProtocol() {
  const [owner, user, other] = await ethers.getSigners();
  const MockVerifier = await ethers.getContractFactory("MockVerifier");
  const MockDecoder = await ethers.getContractFactory("MockDecoder");
  const prover = await MockVerifier.deploy();
  const decoder = await MockDecoder.deploy();
  const Registry = await ethers.getContractFactory("VinceRegistry");
  const registry = await Registry.deploy();
  const Vusd = await ethers.getContractFactory("MockVUSD");
  const vusd = await Vusd.deploy();
  const Verifier = await ethers.getContractFactory("VinceVerifier");
  const verifier = await Verifier.deploy(await prover.getAddress(), await decoder.getAddress());
  const Engine = await ethers.getContractFactory("VinceEngine");
  const engine = await Engine.deploy(
    await registry.getAddress(),
    await decoder.getAddress(),
    await verifier.getAddress(),
  );
  const Gate = await ethers.getContractFactory("VinceGate");
  const gate = await Gate.deploy(await verifier.getAddress(), await engine.getAddress());
  await engine.setGate(await gate.getAddress());
  const Vault = await ethers.getContractFactory("VinceVault");
  const vault = await Vault.deploy(await engine.getAddress(), await vusd.getAddress());
  await vusd.mint(await vault.getAddress(), ethers.parseEther("1000000"));
  await registry.listMarket("eth-bat-usd", 3, 1, BAT, 5_000_000, 3600, "BAT/USD");
  return { owner, user, other, prover, decoder, registry, vusd, verifier, engine, gate, vault };
}

describe("VINCE protocol", function () {
  describe("registry", function () {
    it("owner lists a feed; non-owner cannot", async function () {
      const { registry, other } = await loadFixture(deployProtocol);
      await expect(
        registry.connect(other).listMarket("eth-x", 3, 1, SPCX, 1, 3600, "X"),
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
      const [key, market] = await registry.findByAggregator(BAT);
      expect(key).to.not.equal(ZERO);
      expect(market.listed).to.equal(true);
      expect(market.displayName).to.equal("BAT/USD");
      expect(market.minimumPrice).to.equal(5_000_000n);
    });

    it("does not auto-list an unlisted aggregator", async function () {
      const { registry } = await loadFixture(deployProtocol);
      const [key, market] = await registry.findByAggregator(SPCX);
      expect(key).to.equal(ZERO);
      expect(market.listed).to.equal(false);
    });
  });

  describe("gate / engine", function () {
    it("PASS on listed BAT above floor opens a 30-minute window", async function () {
      const { decoder, gate, engine } = await loadFixture(deployProtocol);
      const now = await time.latest();
      await decoder.setAnswerUpdated(BAT, 7_186_539, 1, now, 1);
      const tx = await gate.submitSourceTransaction(proof(ethers.id("pass-1")));
      await expect(tx).to.emit(engine, "DecisionEmitted");
      expect(await engine.inWindow()).to.equal(true);
      const window = await engine.liveWindow();
      expect(window.pass).to.equal(true);
      expect(window.answer).to.equal(7_186_539n);
      expect(window.validUntil - window.verifiedAt).to.equal(1800n);
    });

    it("unlisted emitter notes REJECT_FEED but still opens the window", async function () {
      const { decoder, gate, engine } = await loadFixture(deployProtocol);
      const now = await time.latest();
      await decoder.setAnswerUpdated(SPCX, 15_185_540_000, 1, now, 1);
      await gate.submitSourceTransaction(proof(ethers.id("spcx")));
      expect(await engine.inWindow()).to.equal(true);
      const last = (await engine.queryFilter(engine.filters.DecisionEmitted())).at(-1);
      expect(last?.args?.decision).to.equal(1n);
      expect(last?.args?.reasons).to.deep.equal(["REJECT_FEED"]);
    });

    it("below-floor listed feed notes REJECT_THRESHOLD but still opens the window", async function () {
      const { decoder, gate, engine } = await loadFixture(deployProtocol);
      const now = await time.latest();
      await decoder.setAnswerUpdated(BAT, 1_000_000, 1, now, 1);
      await gate.submitSourceTransaction(proof(ethers.id("low")));
      expect(await engine.inWindow()).to.equal(true);
      const last = (await engine.queryFilter(engine.filters.DecisionEmitted())).at(-1);
      expect(last?.args?.reasons).to.deep.equal(["REJECT_THRESHOLD"]);
    });

    it("stale round notes REJECT_STALE but still opens the window", async function () {
      const { decoder, gate, engine } = await loadFixture(deployProtocol);
      const now = await time.latest();
      await decoder.setAnswerUpdated(BAT, 7_186_539, 1, now - 3601, 1);
      await gate.submitSourceTransaction(proof(ethers.id("stale")));
      expect(await engine.inWindow()).to.equal(true);
      const last = (await engine.queryFilter(engine.filters.DecisionEmitted())).at(-1);
      expect(last?.args?.reasons).to.deep.equal(["REJECT_STALE"]);
    });

    it("failed source receipt reverts as REJECT_STATUS before policy", async function () {
      const { decoder, gate } = await loadFixture(deployProtocol);
      const now = await time.latest();
      await decoder.setAnswerUpdated(BAT, 7_186_539, 1, now, 0);
      await expect(gate.submitSourceTransaction(proof(ethers.id("fail")))).to.be.revertedWith(
        "REJECT_STATUS",
      );
    });

    it("bad proof fails closed", async function () {
      const { prover, decoder, gate } = await loadFixture(deployProtocol);
      const now = await time.latest();
      await decoder.setAnswerUpdated(BAT, 7_186_539, 1, now, 1);
      await prover.setShouldPass(false);
      await expect(gate.submitSourceTransaction(proof(ethers.id("bad")))).to.be.revertedWith(
        "PROOF_FAILED",
      );
    });

    it("replays of the same source tx revert", async function () {
      const { decoder, gate } = await loadFixture(deployProtocol);
      const now = await time.latest();
      await decoder.setAnswerUpdated(BAT, 7_186_539, 1, now, 1);
      const p = proof(ethers.id("once"));
      await gate.submitSourceTransaction(p);
      await expect(gate.submitSourceTransaction(p)).to.be.revertedWith("REPLAY");
    });

    it("wrong source chainKey is REJECT_SOURCE_CHAIN", async function () {
      const { decoder, gate, engine } = await loadFixture(deployProtocol);
      const now = await time.latest();
      await decoder.setAnswerUpdated(BAT, 7_186_539, 1, now, 1);
      const p = proof(ethers.id("sepolia"));
      p.chainKey = 1n;
      await gate.submitSourceTransaction(p);
      const last = (await engine.queryFilter(engine.filters.DecisionEmitted())).at(-1);
      expect(last?.args?.reasons).to.deep.equal(["REJECT_SOURCE_CHAIN"]);
    });
  });

  describe("vault", function () {
    async function withPass() {
      const ctx = await loadFixture(deployProtocol);
      const now = await time.latest();
      await ctx.decoder.setAnswerUpdated(BAT, 7_186_539, 1, now, 1);
      await ctx.gate.submitSourceTransaction(proof(ethers.id("vault-pass")));
      await ctx.vusd.connect(ctx.user).faucet();
      await ctx.vusd.connect(ctx.user).approve(await ctx.vault.getAddress(), ethers.parseEther("1000"));
      await ctx.vault.connect(ctx.user).deposit(ethers.parseEther("1000"));
      return ctx;
    }

    it("borrow limit is 50% LTV inside the window", async function () {
      const { vault, user } = await withPass();
      expect(await vault.borrowLimitOf(user.address)).to.equal(ethers.parseEther("500"));
      await vault.connect(user).requestBorrow(ethers.parseEther("500"));
      expect(await vault.debt(user.address)).to.equal(ethers.parseEther("500"));
    });

    it("borrow reverts outside the window", async function () {
      const { vault, user } = await withPass();
      await time.increase(1801);
      expect(await vault.borrowLimitOf(user.address)).to.equal(0n);
      await expect(vault.connect(user).requestBorrow(1n)).to.be.revertedWith("NO_WINDOW");
    });

    it("over-LTV borrow reverts", async function () {
      const { vault, user } = await withPass();
      await expect(vault.connect(user).requestBorrow(ethers.parseEther("501"))).to.be.revertedWith(
        "LTV",
      );
    });

    it("withdraw that would break LTV reverts", async function () {
      const { vault, user } = await withPass();
      await vault.connect(user).requestBorrow(ethers.parseEther("500"));
      await expect(vault.connect(user).withdraw(1n)).to.be.revertedWith("LTV");
    });

    it("does not take a price argument", async function () {
      const { vault } = await withPass();
      expect(vault.interface.getFunction("requestBorrow").inputs).to.have.length(1);
    });
  });
});
