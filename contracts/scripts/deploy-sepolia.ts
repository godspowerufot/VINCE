import { ethers, network } from "hardhat";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer key. Set SEPOLIA_PRIVATE_KEY in contracts/.env");
  }

  console.log(`Deploying VINCE Sepolia policy lab on ${network.name} from ${deployer.address}`);

  const Registry = await ethers.getContractFactory("VinceRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const Policy = await ethers.getContractFactory("VincePolicy");
  const policy = await Policy.deploy(await registry.getAddress());
  await policy.waitForDeployment();

  const Vusd = await ethers.getContractFactory("MockVUSD");
  const vusd = await Vusd.deploy();
  await vusd.waitForDeployment();

  const Vault = await ethers.getContractFactory("VinceVault");
  const vault = await Vault.deploy(await policy.getAddress(), await vusd.getAddress());
  await vault.waitForDeployment();

  await (await vusd.mint(await vault.getAddress(), ethers.parseEther("1000000"))).wait();

  const addresses = {
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    prover: "0x0000000000000000000000000000000000000FD2",
    decoder: null,
    registry: await registry.getAddress(),
    verifier: null,
    engine: await policy.getAddress(),
    gate: await policy.getAddress(),
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

  if (addresses.chainId === 11155111) {
    const webDir = path.join(__dirname, "..", "..", "web", "src", "lib");
    mkdirSync(webDir, { recursive: true });
    writeFileSync(
      path.join(webDir, "deployments.generated.json"),
      `${JSON.stringify(addresses, null, 2)}\n`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
