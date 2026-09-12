import type { GateResult } from "./types";

export function receiptSerial(tx: string): string {
  const hex = tx.replace(/^0x/i, "");
  if (hex.length < 8) return "VNC-————";
  return `VNC-${hex.slice(0, 4).toUpperCase()}-${hex.slice(-4).toUpperCase()}`;
}

export function receiptPath(tx: string, settlementTx?: string | null): string {
  const params = new URLSearchParams({ tx: tx.trim() });
  if (settlementTx) params.set("ctc", settlementTx);
  return `/receipt?${params.toString()}`;
}

export function receiptPlaintext(result: GateResult, shareUrl: string): string {
  const merkle = result.merkleProof;
  const continuity = result.continuityProof;
  const notes = result.reasons.filter((reason) => reason !== "PASS");
  return [
    `VINCE RECEIPT ${receiptSerial(result.tx)}`,
    `Source: ${result.chainLabel} feed-update`,
    `Market: ${result.market}`,
    `Observed: ${result.observedHuman ?? "—"}`,
    `Required: ${result.requiredHuman ?? result.requiredNote ?? "—"}`,
    `Inclusion: ${result.proof === "pass" ? "verified" : "failed"}`,
    `Attestation: ${result.proof === "pass" ? "verified" : "failed"}`,
    notes.length ? `Notes: ${notes.join(", ")}` : null,
    `verifySingle: ${result.advanced.verifySingle === true ? "true" : "false"}`,
    merkle ? `Merkle root: ${merkle.root}` : null,
    merkle ? `Merkle siblings: ${merkle.siblings.length}` : null,
    continuity ? `Continuity digest: ${continuity.lowerEndpointDigest}` : null,
    `Source tx: ${result.tx}`,
    `Creditcoin tx: ${result.settlementTx ?? "not submitted"}`,
    "This receipt records a proved print and a policy decision. It is not a trading license.",
    shareUrl,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}
