/**
 * Phase 2 experiment: pasted Ethereum tx → Attestcoin proof → Creditcoin verify.
 *
 * Usage: node run.mjs
 */
const { JsonRpcProvider, Contract } = require("ethers");
const { chainInfo, blockProver, proofProvider } = require("@gluwa/usc-sdk");

const TX_HASH =
  process.argv[2] ||
  "0x21cdceade3cf76d826ea4a36d68c8d3285478062abb445c951fe1c495863e2a0";

const ETH_RPCS = [
  "https://ethereum.publicnode.com",
  "https://eth.llamarpc.com",
  "https://1rpc.io/eth",
  "https://rpc.mevblocker.io",
];

const CREDITCOIN_RPC = "https://rpc.cc3-testnet.creditcoin.network";

const PROOF_BUILDER_URLS = [
  "https://prover.cc3-testnet.creditcoin.network",
  "https://proof-gen-api.cc3-testnet.creditcoin.network/",
];

const AGG_ABI = [
  "function description() view returns (string)",
  "function decimals() view returns (uint8)",
  "function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)",
];

const ANSWER_UPDATED =
  "0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f";

const MINIMUM_PRICE_8DEC = 250n * 10n ** 8n;
const MAX_AGE_SECONDS = 3600;

function stage(name, extra) {
  console.log(`\n[${name}]`);
  if (extra) console.log(extra);
}

async function firstWorkingEthProvider() {
  for (const url of ETH_RPCS) {
    try {
      const p = new JsonRpcProvider(url, 1, { staticNetwork: true });
      const block = await p.getBlockNumber();
      console.log(`Ethereum RPC ok: ${url} (head ${block})`);
      return p;
    } catch (err) {
      console.log(`Ethereum RPC fail: ${url} (${err.message})`);
    }
  }
  throw new Error("No working Ethereum RPC");
}

async function main() {
  const log = {
    startedAt: new Date().toISOString(),
    txHash: TX_HASH,
    creditcoinRpc: CREDITCOIN_RPC,
  };

  stage("Observation");
  const eth = await firstWorkingEthProvider();
  const tx = await eth.getTransaction(TX_HASH);
  if (!tx || tx.blockNumber == null) {
    throw new Error("Transaction not found or still pending on Ethereum");
  }
  const receipt = await eth.getTransactionReceipt(TX_HASH);
  const block = await eth.getBlock(tx.blockNumber);

  log.chainId = Number((await eth.getNetwork()).chainId);
  log.blockNumber = tx.blockNumber;
  log.txTo = tx.to;
  log.status = receipt.status;
  log.blockTime = block.timestamp;
  log.logs = receipt.logs.length;

  console.log(
    JSON.stringify(
      {
        chainId: log.chainId,
        block: tx.blockNumber,
        to: tx.to,
        status: receipt.status,
        blockTime: new Date(block.timestamp * 1000).toISOString(),
        logCount: receipt.logs.length,
      },
      null,
      2,
    ),
  );

  const answerLogs = receipt.logs.filter(
    (l) => l.topics[0] === ANSWER_UPDATED,
  );
  if (answerLogs.length === 0) {
    console.log("No AnswerUpdated log. This tx is not a Chainlink round update.");
  } else {
    const lg = answerLogs[0];
    const answer = BigInt(lg.topics[1]);
    const roundId = BigInt(lg.topics[2]);
    const updatedAt = BigInt(lg.data);
    log.feedEmitter = lg.address;
    log.answer = answer.toString();
    log.roundId = roundId.toString();
    log.updatedAt = Number(updatedAt);
    try {
      const agg = new Contract(lg.address, AGG_ABI, eth);
      log.feedDescription = await agg.description();
      log.feedDecimals = Number(await agg.decimals());
    } catch (err) {
      log.feedDescriptionError = err.message;
    }
    const decimals = log.feedDecimals ?? 8;
    const human = Number(answer) / 10 ** decimals;
    log.observedPriceHuman = human;
    const age = Math.floor(Date.now() / 1000) - Number(updatedAt);
    log.ageSeconds = age;
    const thresholdPass = answer >= MINIMUM_PRICE_8DEC && decimals === 8;
    const fresh = age <= MAX_AGE_SECONDS;
    log.policyPreview = {
      PROOF: "pending",
      TX_SUCCESS: receipt.status === 1,
      THRESHOLD: thresholdPass,
      FRESHNESS: fresh,
      minimumPrice: MINIMUM_PRICE_8DEC.toString(),
    };
    console.log(
      JSON.stringify(
        {
          emitter: lg.address,
          description: log.feedDescription,
          decimals,
          answer: answer.toString(),
          human,
          roundId: roundId.toString(),
          updatedAt: new Date(Number(updatedAt) * 1000).toISOString(),
          ageSeconds: age,
          wouldPassThresholdVs250e8: thresholdPass,
          wouldPassFreshness: fresh,
        },
        null,
        2,
      ),
    );
  }

  stage("Creditcoin");
  const cc = new JsonRpcProvider(CREDITCOIN_RPC);
  const chainInfoProvider = new chainInfo.PrecompileChainInfoProvider(cc);
  const supported = await chainInfoProvider.getSupportedChains();
  log.supportedChains = supported;
  console.log("supportedChains", JSON.stringify(supported, null, 2));

  const match = supported.find((c) => Number(c.chainId) === log.chainId);
  if (!match) {
    log.verification = "SOURCE_CHAIN_NOT_SUPPORTED";
    console.log("FAIL: Ethereum chainId not in getSupportedChains()");
    console.log(JSON.stringify(log, null, 2));
    process.exit(2);
  }
  const chainKey = Number(match.chainKey);
  log.chainKey = chainKey;
  log.chainName = match.chainName;
  console.log(`Using chainKey=${chainKey} (${match.chainName})`);

  try {
    const latest = await chainInfoProvider.getLatestAttestedHeightAndHash(
      chainKey,
    );
    log.latestAttestation = latest;
    console.log("latestAttestation", latest);
  } catch (err) {
    console.log("latestAttestation error", err.message);
  }

  stage("Proof");
  let proofData = null;
  let workingBuilder = null;
  for (const url of PROOF_BUILDER_URLS) {
    console.log(`Trying Proof Builder ${url}`);
    try {
      const builder = new proofProvider.service.ProofBuilder(
        chainKey,
        url,
        30_000,
      );
      console.log(`waitUntilHeightAttested(${chainKey}, ${tx.blockNumber})`);
      await builder.waitUntilHeightAttested(
        chainKey,
        tx.blockNumber,
        10_000,
        180_000,
        5_000,
      );
      const result = await builder.getProof(TX_HASH);
      if (!result.success) {
        console.log(`getProof failed at ${url}:`, result.error);
        log[`builder_${url}`] = { success: false, error: result.error };
        continue;
      }
      workingBuilder = url;
      proofData = result.data;
      log.proofBuilderUrl = url;
      log.proof = {
        success: true,
        headerNumber: proofData.headerNumber,
        cached: proofData.cached,
        txBytesLen: proofData.txBytes?.length,
        merkleSiblings: proofData.merkleProof?.siblings?.length,
        continuityRoots: proofData.continuityProof?.roots?.length,
      };
      console.log("Proof generated", log.proof);
      break;
    } catch (err) {
      console.log(`Builder ${url} error:`, err.message);
      log[`builder_${url}`] = { success: false, error: err.message };
    }
  }

  if (!proofData) {
    log.verification = "PROOF_GENERATION_FAILED";
    console.log("FAIL: could not generate proof");
    console.log(JSON.stringify({ ...log, proofData: undefined }, null, 2));
    process.exit(3);
  }

  stage("Verification");
  const prover = new blockProver.PrecompileBlockProver(cc);
  const verified = await prover.verifySingle(
    proofData.chainKey,
    proofData.headerNumber,
    proofData.txBytes,
    proofData.merkleProof,
    proofData.continuityProof,
  );
  log.verification = verified ? "SUCCESS" : "FAILED";
  console.log("verifySingle =", verified);

  stage("Decision");
  const proofOk = verified === true;
  const statusOk = receipt.status === 1;
  const feedOk = answerLogs.length > 0;
  const thresholdOk = log.policyPreview?.THRESHOLD === true;
  const freshOk = log.policyPreview?.FRESHNESS === true;
  const reasons = [];
  if (!proofOk) reasons.push("REJECT_PROOF");
  if (!statusOk) reasons.push("REJECT_STATUS");
  if (!feedOk) reasons.push("REJECT_FEED");
  if (feedOk && !thresholdOk) reasons.push("REJECT_THRESHOLD");
  if (feedOk && !freshOk) reasons.push("REJECT_STALE");
  const decision = reasons.length === 0 ? "PASS" : "REJECT";
  log.decision = { decision, reasons, proofBuilderUrl: workingBuilder };
  console.log(JSON.stringify(log.decision, null, 2));

  stage("Result");
  console.log(
    JSON.stringify(
      {
        tx: TX_HASH,
        chainKey,
        block: tx.blockNumber,
        proofBuilderUrl: workingBuilder,
        verification: log.verification,
        decision: log.decision.decision,
        reasons: log.decision.reasons,
        feed: log.feedDescription,
        observedPriceHuman: log.observedPriceHuman,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error("FATAL", err);
  process.exit(1);
});
