import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { readFileSync } from "fs";

try {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  // no local .env
}

function accounts(): string[] {
  const fromEnv =
    process.env.SEPOLIA_PRIVATE_KEY ||
    process.env.VINCE_PRIVATE_KEY ||
    process.env.CREDITCOIN_PRIVATE_KEY;
  if (fromEnv && fromEnv.startsWith("0x") && fromEnv.length >= 66) return [fromEnv];
  try {
    if (vars.has("CREDITCOIN_PRIVATE_KEY")) {
      const key = vars.get("CREDITCOIN_PRIVATE_KEY");
      if (key && key.startsWith("0x")) return [key];
    }
  } catch {
    return [];
  }
  return [];
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {},
    sepolia: {
      url:
        process.env.SEPOLIA_RPC ??
        "https://ethereum-sepolia-rpc.publicnode.com",
      chainId: 11155111,
      accounts: accounts(),
    },
    creditcoin_testnet: {
      url: process.env.CREDITCOIN_RPC ?? "https://rpc.cc3-testnet.creditcoin.network",
      chainId: 102031,
      accounts: accounts(),
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
