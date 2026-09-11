import { ethers, network } from "hardhat";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) throw new Error("No deployer key.");

  const sepoliaPath = path.join(__dirname, "..", "deployments", "sepolia.json");
  const current = JSON.parse(readFileSync(sepoliaPath, "utf8")) as {
    engine?: string;
    gate?: string;
  };
  const engine = current.engine ?? current.gate;
  if (!engine) throw new Error("No Sepolia policy address in deployments/sepolia.json");

  console.log("VinceDesk engine", engine, "from", deployer.address);
  const Desk = await ethers.getContractFactory("VinceDesk");
  const desk = await Desk.deploy(engine);
  await desk.waitForDeployment();
  const deskAddress = await desk.getAddress();
  console.log("VinceDesk", deskAddress);

  const next = {
    ...JSON.parse(readFileSync(sepoliaPath, "utf8")),
    desk: deskAddress,
    deskDeployedAt: new Date().toISOString(),
  };
  writeFileSync(sepoliaPath, `${JSON.stringify(next, null, 2)}\n`);

  if (network.name === "sepolia") {
    const webPath = path.join(
      __dirname,
      "..",
      "..",
      "web",
      "src",
      "lib",
      "deployments.generated.json",
    );
    writeFileSync(webPath, `${JSON.stringify(next, null, 2)}\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
