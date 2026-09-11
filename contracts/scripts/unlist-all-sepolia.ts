import { ethers } from "hardhat";
import { readFileSync } from "fs";
import path from "path";

async function main() {
  const sepoliaPath = path.join(__dirname, "..", "deployments", "sepolia.json");
  const { registry: registryAddr } = JSON.parse(readFileSync(sepoliaPath, "utf8")) as {
    registry: string;
  };
  const registry = await ethers.getContractAt("VinceRegistry", registryAddr);
  const rows = (await registry.listedMarkets()) as { id: string; listed: boolean }[];
  console.log("listed before", rows.map((row) => row.id));
  for (const row of rows) {
    if (!row.listed) continue;
    const tx = await registry.unlistMarket(row.id);
    await tx.wait();
    console.log("unlisted", row.id, tx.hash);
  }
  const after = (await registry.listedMarkets()) as { id: string }[];
  console.log("listed after", after.map((row) => row.id));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
