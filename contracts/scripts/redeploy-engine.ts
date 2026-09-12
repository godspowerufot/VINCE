import { artifacts, ethers, network } from "hardhat";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";

/**
 * Replace VinceEngine + VinceGate + VinceDesk. Keep live registry and verifier.
 */
async function main() {
  if (network.name !== "creditcoin_testnet") {
    throw new Error("redeploy-engine is only for creditcoin_testnet.");
  }

  const prevPath = path.join(__dirname, "..", "deployments", "creditcoin-testnet.json");
  const prev = JSON.parse(readFileSync(prevPath, "utf8")) as {
    registry: string;
    decoder: string;
    verifier: string;
    prover: string;
    vault: string;
    vusd: string;
    deployer: string;
  };

  const [deployer] = await ethers.getSigners();
  if (!deployer) throw new Error("No deployer key.");
  console.log(`Redeploying engine/gate/desk on ${network.name} from ${deployer.address}`);

  const Engine = await ethers.getContractFactory("VinceEngine");
  const engine = await Engine.deploy(prev.registry, prev.decoder, prev.verifier);
  await engine.waitForDeployment();

  const Gate = await ethers.getContractFactory("VinceGate");
  const gate = await Gate.deploy(prev.verifier, await engine.getAddress());
  await gate.waitForDeployment();
  await (await engine.setGate(await gate.getAddress())).wait();

  const Desk = await ethers.getContractFactory("VinceDesk");
  const desk = await Desk.deploy(await engine.getAddress());
  await desk.waitForDeployment();

  const addresses = {
    network: network.name,
    chainId: 102031,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    prover: prev.prover,
    decoder: prev.decoder,
    registry: prev.registry,
    verifier: prev.verifier,
    engine: await engine.getAddress(),
    gate: await gate.getAddress(),
    desk: await desk.getAddress(),
    vault: prev.vault,
    vusd: prev.vusd,
  };

  console.log(JSON.stringify(addresses, null, 2));

  const outDir = path.join(__dirname, "..", "deployments");
  mkdirSync(outDir, { recursive: true });
  const body = `${JSON.stringify(addresses, null, 2)}\n`;
  writeFileSync(path.join(outDir, "creditcoin_testnet.json"), body);
  writeFileSync(path.join(outDir, "creditcoin-testnet.json"), body);

  const webDir = path.join(__dirname, "..", "..", "web", "src", "lib");
  writeFileSync(path.join(webDir, "deployments.generated.json"), body);
  const abiDir = path.join(webDir, "abi");
  mkdirSync(abiDir, { recursive: true });
  for (const name of ["VinceEngine", "VinceGate", "VinceDesk"]) {
    const art = await artifacts.readArtifact(name);
    writeFileSync(path.join(abiDir, `${name}.json`), `${JSON.stringify(art.abi, null, 2)}\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
