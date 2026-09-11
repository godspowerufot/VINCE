import { ethers } from "hardhat";

/**
 * Owner lists a REFERENCE_FEED market. Proof does not auto-list.
 *
 * Usage:
 *   ID=eth-googl-usd AGGREGATOR=0x... FLOOR=25000000000 NAME="GOOGL/USD" \
 *     npx hardhat run scripts/list-market.ts --network creditcoin_testnet
 *
 * FLOOR is 8-decimal Chainlink units ($250 = 250e8). Do not invent aggregator addresses.
 */
async function main() {
  const registryAddr = process.env.VINCE_REGISTRY_ADDRESS;
  const id = process.env.ID;
  const aggregator = process.env.AGGREGATOR;
  const floor = process.env.FLOOR;
  const name = process.env.NAME;
  const chainKey = BigInt(process.env.CHAIN_KEY ?? "3");
  const chainId = BigInt(process.env.CHAIN_ID ?? "1");
  const maxAge = BigInt(process.env.MAX_AGE ?? "3600");

  if (!registryAddr || !id || !aggregator || !floor || !name) {
    throw new Error("Need VINCE_REGISTRY_ADDRESS, ID, AGGREGATOR, FLOOR, NAME");
  }

  const registry = await ethers.getContractAt("VinceRegistry", registryAddr);
  const tx = await registry.listMarket(
    id,
    chainKey,
    chainId,
    aggregator,
    BigInt(floor),
    maxAge,
    name,
  );
  console.log("listMarket tx", tx.hash);
  await tx.wait();
  console.log("listed", { id, aggregator, floor, name });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
