import { ethers } from "hardhat";
import { readFileSync } from "fs";
import path from "path";

const addresses = JSON.parse(
  readFileSync(
    path.join(__dirname, "..", "..", "web", "src", "lib", "deployments.generated.json"),
    "utf8",
  ),
);

async function main() {
  const raw = readFileSync("/tmp/vince-observe-result.json", "utf8");
  const observed = JSON.parse(raw);
  if (observed.advanced?.verifySingle !== true) {
    throw new Error("Attestation failed. Fail closed.");
  }
  const [signer] = await ethers.getSigners();
  console.log("signer", signer.address);

  const policy = await ethers.getContractAt("VincePolicy", addresses.gate, signer);
  const vault = await ethers.getContractAt("VinceVault", addresses.vault, signer);
  const vusd = await ethers.getContractAt("MockVUSD", addresses.vusd, signer);

  const already = await policy.processedSourceTx(observed.tx);
  if (already) {
    console.log("policyTx already processed", observed.tx);
    const window = await policy.liveWindow();
    console.log("liveWindow", {
      pass: window.pass,
      emitter: window.emitter,
      answer: window.answer.toString(),
      validUntil: window.validUntil.toString(),
    });
  } else {
    const submit = await policy.submitAttestedFeedUpdate(
      observed.tx,
      observed.chainKey,
      observed.advanced.emitter,
      BigInt(observed.answer),
      observed.updatedAt,
      observed.merkleProof.root,
      observed.continuityProof.lowerEndpointDigest,
    );
    const receipt = await submit.wait();
    console.log("policyTx", receipt?.hash);
    const parsed = receipt!.logs
      .map((log) => {
        try {
          return policy.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((ev) => ev?.name === "DecisionEmitted");
    console.log("decision", Number(parsed?.args?.decision), parsed?.args?.reasons);
  }

  const inWindow = await policy.inWindow();
  console.log("inWindow", inWindow);
  if (!inWindow) throw new Error("Expected PASS window");

  if (!(await vusd.claimed(signer.address))) {
    const faucetTx = await (await vusd.faucet()).wait();
    console.log("faucetTx", faucetTx?.hash);
  }

  const depositAmt = ethers.parseEther("1000");
  const existingCollat = await vault.collateral(signer.address);
  if (existingCollat < depositAmt) {
    await (await vusd.approve(addresses.vault, depositAmt)).wait();
    const depositTx = await (await vault.deposit(depositAmt - existingCollat)).wait();
    console.log("depositTx", depositTx?.hash);
  }

  const limit = await vault.borrowLimitOf(signer.address);
  console.log("borrowLimit", ethers.formatEther(limit));
  const existingDebt = await vault.debt(signer.address);
  const targetDebt = ethers.parseEther("500");
  if (existingDebt < targetDebt) {
    const borrowTx = await (await vault.requestBorrow(targetDebt - existingDebt)).wait();
    console.log("borrowTx", borrowTx?.hash);
  }
  console.log("debt", ethers.formatEther(await vault.debt(signer.address)));
  console.log("collateral", ethers.formatEther(await vault.collateral(signer.address)));
  console.log("E2E_OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
