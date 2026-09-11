"use client";

import { useState } from "react";
import { shortenHash } from "@/lib/hash";
import type { GateResult } from "@/lib/protocol/types";
import { SEPOLIA } from "@/lib/protocol/constants";

export function AdvancedPanel({ result }: { result: GateResult }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-line pt-6">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="text-[13px] text-mute transition-colors duration-200 hover:text-ink"
      >
        Verification details
      </button>
      {open ? (
        <dl className="mt-5 grid gap-x-8 gap-y-4 text-[13px] sm:grid-cols-2">
          <Row label="Source chain" value={result.advanced.sourceChain} />
          <Row label="chainKey" value={result.advanced.chainKey} />
          <Row label="Pasted tx" value={shortenHash(result.tx, 8)} />
          <Row label="Feed" value={result.advanced.feed} />
          <Row label="Emitter" value={shortenHash(result.advanced.emitter, 6)} />
          <Row label="Block" value={result.advanced.block} />
          <Row label="Observed at" value={result.advanced.observedAt} />
          <Row label="Price model" value={result.advanced.priceModel} />
          <Row
            label="Merkle siblings"
            value={String(result.advanced.merkleSiblings)}
          />
          <Row
            label="Continuity roots"
            value={String(result.advanced.continuityRoots)}
          />
          <Row label="Proof builder" value={result.advanced.proofBuilder} />
          <Row
            label="verifySingle"
            value={result.advanced.verifySingle ? "true" : "false"}
          />
          {result.settlementTx ? (
            <Row
              label="Sepolia tx"
              value={`${SEPOLIA.explorer}/tx/${result.settlementTx}`}
            />
          ) : (
            <Row label="Sepolia tx" value="not submitted" />
          )}
        </dl>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-mute">{label}</dt>
      <dd className="mt-1 break-all text-ink">{value}</dd>
    </div>
  );
}
