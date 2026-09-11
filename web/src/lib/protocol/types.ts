export type MerkleSibling = {
  hash: string;
  isLeft: boolean;
};

export type MerkleProofView = {
  root: string;
  siblings: MerkleSibling[];
};

export type ContinuityProofView = {
  lowerEndpointDigest: string;
  roots: string[];
};

export type PolicyReason =
  | "PASS"
  | "REJECT_FEED"
  | "REJECT_STALE"
  | "REJECT_THRESHOLD"
  | "REJECT_STATUS"
  | "REJECT_DECODE"
  | "REJECT_SOURCE_CHAIN"
  | "REJECT_FEED_FROZEN"
  | "PROOF_FAILED";

export type CheckState = "pending" | "pass" | "fail";

export type ListedMarket = {
  id: string;
  display: string;
  floor: string;
  ready: boolean;
  note: string | null;
  feedAggregator?: string;
  minimumPrice?: string;
  sourceChainKey?: number;
  maxAgeSeconds?: number;
  liveRpcHuman?: string | null;
  liveRpcUpdatedAt?: number | null;
};

export type GateResult = {
  tx: string;
  market: string;
  listed: boolean;
  observedHuman: string | null;
  requiredHuman: string | null;
  requiredNote: string | null;
  chainLabel: "Ethereum" | "Sepolia";
  proof: CheckState;
  condition: CheckState;
  conditionLabel: string;
  decision: "PASS" | "REJECT";
  reasons: PolicyReason[];
  footnote: string | null;
  preview: boolean;
  settlementTx: string | null;
  merkleProof: MerkleProofView | null;
  continuityProof: ContinuityProofView | null;
  advanced: {
    sourceChain: string;
    chainKey: string;
    feed: string;
    emitter: string;
    block: string;
    observedAt: string;
    priceModel: string;
    merkleSiblings: number;
    continuityRoots: number;
    proofBuilder: string;
    verifySingle: boolean | null;
  };
};

export const STAGES = [
  "Validating source transaction…",
  "Waiting for source block attestation…",
  "Generating Merkle and continuity proofs…",
  "Verifying on Creditcoin…",
] as const;

export type ObserveResult = GateResult & {
  chainKey: number;
  blockHeight: number;
  txBytes: string;
  submitReady: boolean;
  answer: string | null;
  updatedAt: number;
};

export type ObserveEvent =
  | { type: "stage"; stageIndex: number }
  | { type: "error"; error: string; stage: "load" | "attestation" | "proof" | "verify" }
  | { type: "result"; result: ObserveResult };
