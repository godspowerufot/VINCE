const { JsonRpcProvider, Contract } = require("ethers");

const TX_HASH =
  "0xd24a64c8aca36f2e18d828cdeab55d0763870b694ce48ee75f39f7b917c52bdc";

const ETH_RPCS = [
  "https://ethereum.publicnode.com",
  "https://eth.llamarpc.com",
  "https://1rpc.io/eth",
];

const AGG_ABI = [
  "function description() view returns (string)",
  "function decimals() view returns (uint8)",
  "function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)",
  "function typeAndVersion() view returns (string)",
];

const ANSWER_UPDATED =
  "0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f";

async function provider() {
  for (const url of ETH_RPCS) {
    try {
      const p = new JsonRpcProvider(url, 1, { staticNetwork: true });
      await p.getBlockNumber();
      return p;
    } catch {}
  }
  throw new Error("no rpc");
}

async function main() {
  const eth = await provider();
  const tx = await eth.getTransaction(TX_HASH);
  const receipt = await eth.getTransactionReceipt(TX_HASH);
  const out = {
    txHash: TX_HASH,
    from: tx.from,
    to: tx.to,
    blockNumber: tx.blockNumber,
    status: receipt.status,
    logCount: receipt.logs.length,
    answerUpdated: [],
  };

  const uniqueEmitters = new Set();
  for (const log of receipt.logs) {
    if (log.topics[0] === ANSWER_UPDATED) {
      uniqueEmitters.add(log.address);
      out.answerUpdated.push({
        emitter: log.address,
        answer: BigInt(log.topics[1]).toString(),
        roundId: log.topics[2] ? BigInt(log.topics[2]).toString() : null,
      });
    }
  }

  out.emitters = [];
  for (const addr of uniqueEmitters) {
    const c = new Contract(addr, AGG_ABI, eth);
    const row = { address: addr };
    for (const fn of ["description", "decimals", "typeAndVersion"]) {
      try {
        row[fn] = (await c[fn]()).toString();
      } catch {
        row[fn] = null;
      }
    }
    try {
      const [, answer, , updatedAt] = await c.latestRoundData();
      row.latestAnswer = answer.toString();
      row.human =
        row.decimals != null
          ? Number(answer) / 10 ** Number(row.decimals)
          : null;
      row.updatedAtIso = new Date(Number(updatedAt) * 1000).toISOString();
    } catch (e) {
      row.latestError = e.shortMessage || e.message;
    }
    out.emitters.push(row);
  }

  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
