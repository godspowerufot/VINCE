import { JsonRpcProvider, Contract } from "ethers";
import { chainInfo, blockProver, proofProvider } from "@gluwa/usc-sdk";
import {
  ANSWER_UPDATED,
  ATTESTCOIN,
  ETHEREUM,
} from "./constants";
import { floorLabel, formatUsd8, matchSeed } from "./markets";
import type { ContinuityProofView, MerkleProofView, ObserveEvent, ObserveResult, PolicyReason } from "./types";

const AGG_ABI = [
  "function description() view returns (string)",
  "function decimals() view returns (uint8)",
];

function asHex(value: string): string {
  return value.startsWith("0x") ? value : `0x${value}`;
}

async function ethProvider() {
  const extra = process.env.ETH_RPC;
  const urls = extra ? [extra, ...ETHEREUM.rpcs] : [...ETHEREUM.rpcs];
  for (const url of urls) {
    try {
      const provider = new JsonRpcProvider(url, 1, { staticNetwork: true });
      await provider.getBlockNumber();
      return provider;
    } catch {
      continue;
    }
  }
  throw new Error("Ethereum RPC unavailable. Fail closed.");
}

export async function observeSourceTx(
  pasted: string,
  emit: (event: ObserveEvent) => void,
): Promise<void> {
  const txHash = pasted.trim().toLowerCase();
  if (!/^0x[0-9a-f]{64}$/.test(txHash)) {
    emit({
      type: "error",
      error: "Could not load that transaction. Use a 0x hash with 64 hex characters.",
      stage: "load",
    });
    return;
  }

  emit({ type: "stage", stageIndex: 0 });
  let eth;
  try {
    eth = await ethProvider();
  } catch {
    emit({
      type: "error",
      error: "Could not reach Ethereum. Verification unavailable.",
      stage: "load",
    });
    return;
  }

  const tx = await eth.getTransaction(txHash);
  if (!tx || tx.blockNumber == null) {
    emit({
      type: "error",
      error: "Could not load that transaction. It is unknown or still pending on Ethereum.",
      stage: "load",
    });
    return;
  }
  if (tx.hash.toLowerCase() !== txHash) {
    emit({
      type: "error",
      error: "Loaded hash did not match the pasted hash. Fail closed.",
      stage: "load",
    });
    return;
  }

  const receipt = await eth.getTransactionReceipt(txHash);
  if (!receipt) {
    emit({
      type: "error",
      error: "Could not load that transaction receipt.",
      stage: "load",
    });
    return;
  }

  const creditcoinRpc =
    process.env.CREDITCOIN_RPC ?? ATTESTCOIN.creditcoinRpc;
  const cc = new JsonRpcProvider(creditcoinRpc);
  const chainInfoProvider = new chainInfo.PrecompileChainInfoProvider(cc);
  const supported = await chainInfoProvider.getSupportedChains();
  const chainId = Number((await eth.getNetwork()).chainId);
  const match = supported.find((c) => Number(c.chainId) === chainId);
  if (!match) {
    emit({
      type: "error",
      error: "That source chain is not in Attestcoin getSupportedChains(). Fail closed.",
      stage: "attestation",
    });
    return;
  }
  const chainKey = Number(match.chainKey);

  emit({ type: "stage", stageIndex: 1 });
  const builderUrl = process.env.PROOF_BUILDER_URL ?? ATTESTCOIN.proofBuilder;
  const builder = new proofProvider.service.ProofBuilder(chainKey, builderUrl, 30_000);
  try {
    await builder.waitUntilHeightAttested(chainKey, tx.blockNumber, 10_000, 180_000, 5_000);
  } catch {
    emit({
      type: "error",
      error: "Source block is not attested yet, or attestation wait failed. Fail closed.",
      stage: "attestation",
    });
    return;
  }

  emit({ type: "stage", stageIndex: 2 });
  const proofResult = await builder.getProof(txHash);
  if (!proofResult.success || !proofResult.data) {
    emit({
      type: "error",
      error: proofResult.error
        ? `Could not generate proof for the pasted hash. ${proofResult.error}`
        : "Could not generate proof for the pasted hash. Fail closed.",
      stage: "proof",
    });
    return;
  }
  if (proofResult.data.txHash.toLowerCase() !== txHash) {
    emit({
      type: "error",
      error: "Proof builder returned a different hash than the one pasted. Fail closed.",
      stage: "proof",
    });
    return;
  }

  const merkleProof: MerkleProofView = {
    root: asHex(proofResult.data.merkleProof.root),
    siblings: proofResult.data.merkleProof.siblings.map((s) => ({
      hash: asHex(s.hash),
      isLeft: Boolean(s.isLeft),
    })),
  };
  const continuityProof: ContinuityProofView = {
    lowerEndpointDigest: asHex(proofResult.data.continuityProof.lowerEndpointDigest),
    roots: proofResult.data.continuityProof.roots.map(asHex),
  };

  emit({ type: "stage", stageIndex: 3 });
  const prover = new blockProver.PrecompileBlockProver(cc);
  let verified = false;
  try {
    verified = await prover.verifySingle(
      proofResult.data.chainKey,
      proofResult.data.headerNumber,
      proofResult.data.txBytes,
      proofResult.data.merkleProof,
      proofResult.data.continuityProof,
    );
  } catch {
    emit({
      type: "error",
      error: "Block Prover call failed. Verification unavailable.",
      stage: "verify",
    });
    return;
  }
  if (!verified) {
    emit({
      type: "error",
      error: "Could not verify source transaction. The inclusion proof did not pass.",
      stage: "verify",
    });
    return;
  }

  const answerLogs = receipt.logs.filter((log) => log.topics[0] === ANSWER_UPDATED);
  const chainLabel = chainId === 11155111 ? "Sepolia" : "Ethereum";
  const sourceChain = chainId === 11155111 ? "Ethereum Sepolia" : "Ethereum Mainnet";

  let emitter = "";
  let description = "unknown feed";
  let answer: bigint | null = null;
  let updatedAt = 0;
  if (answerLogs.length > 0) {
    const log = answerLogs[0];
    emitter = log.address;
    answer = BigInt(log.topics[1] ?? "0");
    updatedAt = Number(BigInt(log.data || "0"));
    try {
      const agg = new Contract(log.address, AGG_ABI, eth);
      description = await agg.description();
    } catch {
      description = "feed (description unavailable)";
    }
  }

  const listed = emitter ? matchSeed(emitter) : null;
  const statusOk = receipt.status === 1;
  const reasons: PolicyReason[] = [];
  if (!statusOk) reasons.push("REJECT_STATUS");
  if (!answerLogs.length) reasons.push("REJECT_DECODE");
  if (answerLogs.length && !listed) reasons.push("REJECT_FEED");
  if (listed && Number(match.chainKey) !== listed.sourceChainKey) {
    reasons.push("REJECT_SOURCE_CHAIN");
  }
  if (listed && answer != null && answer < BigInt(listed.minimumPrice)) {
    reasons.push("REJECT_THRESHOLD");
  }
  const age = Math.floor(Date.now() / 1000) - updatedAt;
  if (listed && (updatedAt === 0 || age > listed.maxAgeSeconds)) {
    reasons.push("REJECT_STALE");
  }

  const pass = reasons.length === 0 && Boolean(listed);
  const observedHuman = answer != null ? formatUsd8(answer) : null;
  const requiredHuman = listed ? floorLabel(BigInt(listed.minimumPrice)) : null;

  let conditionLabel = "Market condition satisfied";
  if (!statusOk) conditionLabel = "Source transaction failed";
  else if (!answerLogs.length) conditionLabel = "Not a Chainlink feed-update";
  else if (!listed) conditionLabel = "This market is not listed";
  else if (reasons.includes("REJECT_THRESHOLD")) conditionLabel = "Price is below this market’s floor";
  else if (reasons.includes("REJECT_STALE")) conditionLabel = "This print is too old";
  else if (reasons.includes("REJECT_SOURCE_CHAIN")) conditionLabel = "Wrong source chain for this listing";

  const result: ObserveResult = {
    tx: txHash,
    market: listed?.displayName ?? description,
    listed: Boolean(listed),
    observedHuman,
    requiredHuman,
    requiredNote: listed ? null : "this market is not listed",
    chainLabel,
    proof: "pass",
    condition: pass ? "pass" : "fail",
    conditionLabel,
    decision: pass ? "PASS" : "REJECT",
    reasons: pass ? ["PASS"] : reasons,
    footnote: listed
      ? null
      : "VINCE proved the print. It did not open a window. Listing is an owner action, not a side effect of paste.",
    preview: true,
    settlementTx: null,
    merkleProof,
    continuityProof,
    chainKey: proofResult.data.chainKey,
    blockHeight: proofResult.data.headerNumber,
    txBytes: proofResult.data.txBytes,
    submitReady: verified && Boolean(merkleProof.root) && Boolean(continuityProof.lowerEndpointDigest),
    answer: answer != null ? answer.toString() : null,
    updatedAt,
    advanced: {
      sourceChain,
      chainKey: `${chainKey} (CC3 Testnet)`,
      feed: listed?.displayName ?? description,
      emitter: emitter || "—",
      block: String(tx.blockNumber),
      observedAt: updatedAt ? new Date(updatedAt * 1000).toISOString() : "—",
      priceModel: "Chainlink · 8 decimals",
      merkleSiblings: merkleProof.siblings.length,
      continuityRoots: continuityProof.roots.length,
      proofBuilder: builderUrl,
      verifySingle: true,
    },
  };

  emit({ type: "result", result });
}
