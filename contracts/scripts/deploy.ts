import { artifacts, ethers, network } from "hardhat";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";

const CC3_TESTNET_PROVER = "0x0000000000000000000000000000000000000FD2";
const CC3_TESTNET_DECODER = "0x731c345d79Fb8BbDC541f9DF3b6317585F849F9f";

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error(
      "No deployer key. Set CREDITCOIN_PRIVATE_KEY or `npx hardhat vars set CREDITCOIN_PRIVATE_KEY`.",
    );
  }

  console.log(`Deploying VINCE on ${network.name} from ${deployer.address}`);

  let prover = CC3_TESTNET_PROVER;
  let decoder = CC3_TESTNET_DECODER;

  if (network.name === "hardhat" || network.name === "localhost") {
    const MockVerifier = await ethers.getContractFactory("MockVerifier");
    const MockDecoder = await ethers.getContractFactory("MockDecoder");
    const mockVerifier = await MockVerifier.deploy();
    const mockDecoder = await MockDecoder.deploy();
    await mockVerifier.waitForDeployment();
    await mockDecoder.waitForDeployment();
    prover = await mockVerifier.getAddress();
    decoder = await mockDecoder.getAddress();
    console.log("MockVerifier", prover);
    console.log("MockDecoder", decoder);
  }

  const Registry = await ethers.getContractFactory("VinceRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const Vusd = await ethers.getContractFactory("MockVUSD");
  const vusd = await Vusd.deploy();
  await vusd.waitForDeployment();

  const Verifier = await ethers.getContractFactory("VinceVerifier");
  const verifier = await Verifier.deploy(prover, decoder);
  await verifier.waitForDeployment();

  const Engine = await ethers.getContractFactory("VinceEngine");
  const engine = await Engine.deploy(
    await registry.getAddress(),
    decoder,
    await verifier.getAddress(),
  );
  await engine.waitForDeployment();

  const Gate = await ethers.getContractFactory("VinceGate");
  const gate = await Gate.deploy(await verifier.getAddress(), await engine.getAddress());
  await gate.waitForDeployment();
  await (await engine.setGate(await gate.getAddress())).wait();

  const Desk = await ethers.getContractFactory("VinceDesk");
  const desk = await Desk.deploy(await engine.getAddress());
  await desk.waitForDeployment();

  const Vault = await ethers.getContractFactory("VinceVault");
  const vault = await Vault.deploy(await engine.getAddress(), await vusd.getAddress());
  await vault.waitForDeployment();

  await (await vusd.mint(await vault.getAddress(), ethers.parseEther("1000000"))).wait();

  const addresses = {
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    prover,
    decoder,
    registry: await registry.getAddress(),
    verifier: await verifier.getAddress(),
    engine: await engine.getAddress(),
    gate: await gate.getAddress(),
    desk: await desk.getAddress(),
    vault: await vault.getAddress(),
    vusd: await vusd.getAddress(),
  };

  console.log(JSON.stringify(addresses, null, 2));

  const outDir = path.join(__dirname, "..", "deployments");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    path.join(outDir, `${network.name}.json`),
    `${JSON.stringify(addresses, null, 2)}\n`,
  );

  if (addresses.chainId === 102031) {
    writeFileSync(
      path.join(outDir, "creditcoin-testnet.json"),
      `${JSON.stringify(addresses, null, 2)}\n`,
    );
    const webDir = path.join(__dirname, "..", "..", "web", "src", "lib");
    mkdirSync(webDir, { recursive: true });
    writeFileSync(
      path.join(webDir, "deployments.generated.json"),
      `${JSON.stringify(addresses, null, 2)}\n`,
    );
    const abiDir = path.join(webDir, "abi");
    mkdirSync(abiDir, { recursive: true });
    for (const name of [
      "VinceRegistry",
      "VinceVerifier",
      "VinceEngine",
      "VinceGate",
      "VinceDesk",
      "VinceVault",
      "MockVUSD",
    ]) {
      const art = await artifacts.readArtifact(name);
      writeFileSync(path.join(abiDir, `${name}.json`), `${JSON.stringify(art.abi, null, 2)}\n`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
