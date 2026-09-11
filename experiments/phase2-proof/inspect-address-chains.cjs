const { JsonRpcProvider } = require("ethers");

const ADDR = "0x413e725094c7810669F91856cc58e73eA3fbc400";

const CHAINS = [
  { name: "ethereum", url: "https://ethereum.publicnode.com", chainId: 1 },
  { name: "sepolia", url: "https://ethereum-sepolia-rpc.publicnode.com", chainId: 11155111 },
  { name: "base", url: "https://base-rpc.publicnode.com", chainId: 8453 },
  { name: "creditcoin-testnet", url: "https://rpc.cc3-testnet.creditcoin.network", chainId: 102031 },
  { name: "creditcoin", url: "https://mainnet3.creditcoin.network", chainId: 102030 },
];

async function main() {
  for (const c of CHAINS) {
    try {
      const p = new JsonRpcProvider(c.url, c.chainId, { staticNetwork: true });
      const [code, txCount, bal] = await Promise.all([
        p.getCode(ADDR),
        p.getTransactionCount(ADDR),
        p.getBalance(ADDR),
      ]);
      console.log(
        JSON.stringify({
          chain: c.name,
          isContract: code !== "0x",
          codeLen: Math.max(0, (code.length - 2) / 2),
          nonce: txCount,
          balanceWei: bal.toString(),
        }),
      );
    } catch (e) {
      console.log(JSON.stringify({ chain: c.name, error: e.message }));
    }
  }
}

main();
