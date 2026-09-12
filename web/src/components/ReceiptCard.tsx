"use client";

import { useState } from "react";
import { Mark } from "@/components/Mark";
import { ProofPanel } from "@/components/ProofPanel";
import { SETTLEMENT } from "@/lib/protocol/constants";
import { receiptPath, receiptPlaintext, receiptSerial } from "@/lib/protocol/receipt";
import type { GateResult } from "@/lib/protocol/types";
import { shortenHash } from "@/lib/hash";

export function ReceiptCard({
  result,
  shareOrigin,
}: {
  result: GateResult;
  shareOrigin?: string;
}) {
  const [copied, setCopied] = useState<"link" | "text" | null>(null);
  const serial = receiptSerial(result.tx);
  const path = receiptPath(result.tx, result.settlementTx);
  const shareUrl = shareOrigin ? `${shareOrigin}${path}` : path;
  const inclusion = result.proof === "pass" ? "verified" : "failed";
  const attestation =
    result.proof === "pass" ? "Attested on Creditcoin" : result.conditionLabel;
  const notes = result.reasons.filter((reason) => reason !== "PASS");

  async function copy(kind: "link" | "text") {
    const payload = kind === "link" ? shareUrl : receiptPlaintext(result, shareUrl);
    await navigator.clipboard.writeText(payload);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <article className="border border-line">
      <header className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-4">
        <div>
          <p className="font-display text-[11px] font-medium tracking-[0.14em] text-mute">
            VINCE RECEIPT
          </p>
          <p className="mt-1 font-display text-[18px] font-medium tracking-[-0.02em]">
            {result.market}
          </p>
        </div>
        <p className="shrink-0 font-sans text-[12px] tabular-nums text-mute">{serial}</p>
      </header>

      <div className="space-y-6 px-5 py-5">
        <p className="text-[13px] leading-5 text-mute">
          {result.chainLabel} source · Attestcoin proof
          {result.preview ? " · preview" : ""}
        </p>

        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-[12px] text-mute">Observed print</dt>
            <dd className="mt-1 font-sans text-[22px] tabular-nums">
              {result.observedHuman ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[12px] text-mute">Required</dt>
            <dd className="mt-1 font-sans text-[22px] tabular-nums">
              {result.requiredHuman ?? "—"}
            </dd>
            {result.requiredNote ? (
              <p className="mt-1 text-[13px] text-mute">{result.requiredNote}</p>
            ) : null}
          </div>
        </dl>

        <div className="space-y-3">
          <Mark state={result.proof} label={`Inclusion ${inclusion}`} />
          <Mark
            state={result.proof === "pass" ? "pass" : "fail"}
            label={attestation}
          />
        </div>
        {notes.length > 0 ? (
          <p className="text-[13px] leading-5 text-mute">
            Notes {notes.join(" · ")} — informational. The product stops at attestation.
          </p>
        ) : null}

        <dl className="grid gap-4 border-t border-line pt-5 text-[13px] sm:grid-cols-2">
          <Row label="Source tx" value={shortenHash(result.tx, 8)} />
          <Row
            label="Creditcoin tx"
            value={
              result.settlementTx ? shortenHash(result.settlementTx, 8) : "not submitted"
            }
          />
          <Row label="verifySingle" value={result.advanced.verifySingle === true ? "true" : "false"} />
          <Row
            label="Emitter"
            value={
              result.advanced.emitter
                ? shortenHash(result.advanced.emitter, 6)
                : "—"
            }
          />
        </dl>

        {result.settlementTx ? (
          <a
            href={`${SETTLEMENT.explorer}/tx/${result.settlementTx}`}
            className="block text-[13px] text-accent hover:text-ink"
            target="_blank"
            rel="noreferrer"
          >
            Open Creditcoin tx
          </a>
        ) : null}

        <div className="border-t border-line pt-5">
          <p className="text-[12px] text-mute">Proof annex</p>
          <div className="mt-4">
            <ProofPanel merkle={result.merkleProof} continuity={result.continuityProof} />
          </div>
        </div>

        <p className="text-[13px] leading-5 text-mute">
          This receipt records a proved Ethereum feed-update and VINCE’s policy
          decision. It does not certify a token for trading.
        </p>

        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <button
            type="button"
            onClick={() => void copy("link")}
            className="text-[13px] text-accent transition-colors duration-200 hover:text-ink"
          >
            {copied === "link" ? "Link copied" : "Copy share link"}
          </button>
          <button
            type="button"
            onClick={() => void copy("text")}
            className="text-[13px] text-mute transition-colors duration-200 hover:text-ink"
          >
            {copied === "text" ? "Text copied" : "Copy receipt text"}
          </button>
        </div>
      </div>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-mute">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  );
}
