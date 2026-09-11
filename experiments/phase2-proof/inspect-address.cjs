const { JsonRpcProvider, Contract } = require("ethers");

const ADDR = "0x413e725094c7810669F91856cc58e73eA3fbc400";
const ETH_RPCS = [
  "https://ethereum.publicnode.com",
  "https://eth.llamarpc.com",
  "https://1rpc.io/eth",
];

const ABI = [
  "function description() view returns (string)",
  "function decimals() view returns (uint8)",
  "function version() view returns (uint256)",
  "function aggregator() view returns (address)",
  "function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)",
  "function typeAndVersion() view returns (string)",
  "function owner() view returns (address)",
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
  const code = await eth.getCode(ADDR);
  const out = {
    address: ADDR,
    isContract: code !== "0x" && code !== "0x0",
    bytecodeLen: Math.max(0, (code.length - 2) / 2),
  };

  if (!out.isContract) {
    console.log(JSON.stringify({ ...out, note: "EOA or empty — not a feed" }, null, 2));
    return;
  }

  const c = new Contract(ADDR, ABI, eth);
  for (const fn of ["description", "decimals", "version", "aggregator", "typeAndVersion", "owner"]) {
    try {
      out[fn] = (await c[fn]()).toString();
    } catch (e) {
      out[fn] = null;
    }
  }
  try {
    const [roundId, answer, startedAt, updatedAt, answeredInRound] =
      await c.latestRoundData();
    out.latestRoundData = {
      roundId: roundId.toString(),
      answer: answer.toString(),
      human:
        out.decimals != null
          ? Number(answer) / 10 ** Number(out.decimals)
          : null,
      startedAt: Number(startedAt),
      updatedAt: Number(updatedAt),
      updatedAtIso: new Date(Number(updatedAt) * 1000).toISOString(),
      answeredInRound: answeredInRound.toString(),
      ageSeconds: Math.floor(Date.now() / 1000) - Number(updatedAt),
    };
  } catch (e) {
    out.latestRoundDataError = e.shortMessage || e.message;
  }

  const target = out.aggregator && out.aggregator !== ADDR ? out.aggregator : ADDR;
  out.logTarget = target;
  try {
    const logs = await eth.getLogs({
      address: target,
      topics: [ANSWER_UPDATED],
      fromBlock: (await eth.getBlockNumber()) - 5000,
      toBlock: "latest",
    });
    out.recentAnswerUpdated = logs.slice(-3).map((l) => ({
      txHash: l.transactionHash,
      block: l.blockNumber,
      answer: BigInt(l.topics[1]).toString(),
    }));
  } catch (e) {
    out.recentLogsError = e.shortMessage || e.message;
  }

  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
