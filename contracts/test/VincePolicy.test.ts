import { expect } from "chai";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

const BAT = "0x1c9049C48C24111A3546a73C67FD2A4Fc6C86Fdc";
const SPCX = "0x1d37422e15ee379549B0B8E2a47523D3Ef5071a9";
const TX = ethers.id("bat-source-tx");
const MERKLE = ethers.id("merkle-root");
const CONT = ethers.id("continuity-digest");

async function deployLab() {
  const [owner, user] = await ethers.getSigners();
  const Registry = await ethers.getContractFactory("VinceRegistry");
  const registry = await Registry.deploy();
  const Policy = await ethers.getContractFactory("VincePolicy");
  const policy = await Policy.deploy(await registry.getAddress());
  const Vusd = await ethers.getContractFactory("MockVUSD");
  const vusd = await Vusd.deploy();
  const Vault = await ethers.getContractFactory("VinceVault");
  const vault = await Vault.deploy(await policy.getAddress(), await vusd.getAddress());
  await vusd.mint(await vault.getAddress(), ethers.parseEther("1000000"));
  await registry.listMarket("eth-bat-usd", 3, 1, BAT, 5_000_000, 3600, "BAT/USD");
  return { owner, user, registry, policy, vusd, vault };
}

describe("VINCE Sepolia policy lab", function () {
  it("rejects submit without proof fingerprints", async function () {
    const { policy } = await loadFixture(deployLab);
    const now = await time.latest();
    await expect(
      policy.submitAttestedFeedUpdate(TX, 3, BAT, 7_186_539, now, ethers.ZeroHash, CONT),
    ).to.be.revertedWith("PROOF_REQUIRED");
  });

  it("PASS opens a 30-minute window", async function () {
    const { policy } = await loadFixture(deployLab);
    const now = await time.latest();
    await policy.submitAttestedFeedUpdate(TX, 3, BAT, 7_186_539, now, MERKLE, CONT);
    expect(await policy.inWindow()).to.equal(true);
  });

  it("unlisted emitter is REJECT_FEED", async function () {
    const { policy } = await loadFixture(deployLab);
    const now = await time.latest();
    await policy.submitAttestedFeedUpdate(ethers.id("spcx"), 3, SPCX, 15_185_540_000, now, MERKLE, CONT);
    expect(await policy.inWindow()).to.equal(false);
    const last = (await policy.queryFilter(policy.filters.DecisionEmitted())).at(-1);
    expect(last?.args?.reasons).to.deep.equal(["REJECT_FEED"]);
  });

  it("stale print is REJECT_STALE", async function () {
    const { policy } = await loadFixture(deployLab);
    const now = await time.latest();
    await policy.submitAttestedFeedUpdate(TX, 3, BAT, 7_186_539, now - 3601, MERKLE, CONT);
    const last = (await policy.queryFilter(policy.filters.DecisionEmitted())).at(-1);
    expect(last?.args?.reasons).to.deep.equal(["REJECT_STALE"]);
  });

  it("replay reverts", async function () {
    const { policy } = await loadFixture(deployLab);
    const now = await time.latest();
    await policy.submitAttestedFeedUpdate(TX, 3, BAT, 7_186_539, now, MERKLE, CONT);
    await expect(
      policy.submitAttestedFeedUpdate(TX, 3, BAT, 7_186_539, now, MERKLE, CONT),
    ).to.be.revertedWith("REPLAY");
  });

  it("vault borrow is 50% LTV inside the window", async function () {
    const { policy, vault, vusd, user } = await loadFixture(deployLab);
    const now = await time.latest();
    await policy.submitAttestedFeedUpdate(TX, 3, BAT, 7_186_539, now, MERKLE, CONT);
    await vusd.connect(user).faucet();
    await vusd.connect(user).approve(await vault.getAddress(), ethers.parseEther("1000"));
    await vault.connect(user).deposit(ethers.parseEther("1000"));
    expect(await vault.borrowLimitOf(user.address)).to.equal(ethers.parseEther("500"));
    await vault.connect(user).requestBorrow(ethers.parseEther("500"));
    expect(await vault.debt(user.address)).to.equal(ethers.parseEther("500"));
  });
});
