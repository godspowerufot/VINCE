import type { GateResult } from "@/lib/protocol/types";
import { Mark } from "@/components/Mark";
import { SETTLEMENT } from "@/lib/protocol/constants";
import { shortenHash } from "@/lib/hash";

export function Verdict({ result }: { result: GateResult }) {
  return (
    <div className="space-y-8">
      <dl className="grid gap-6 sm:grid-cols-3">
        <div>
          <dt className="text-[12px] text-mute">Matched market</dt>
          <dd className="mt-1 font-display text-[20px] font-medium tracking-[-0.02em]">
            {result.market}
          </dd>
        </div>
        <div>
          <dt className="text-[12px] text-mute">Official feed</dt>
          <dd className="mt-1 font-sans text-[20px] tabular-nums">
            {result.observedHuman ?? "—"}
            {result.preview ? (
              <span className="ml-2 text-[11px] uppercase tracking-[0.08em] text-mute">
                Preview
              </span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-[12px] text-mute">Required</dt>
          <dd className="mt-1 font-sans text-[20px] tabular-nums">
            {result.requiredHuman ?? "—"}
            {result.requiredNote ? (
              <p className="mt-1 text-[13px] font-normal tracking-normal text-mute">
                {result.requiredNote}
              </p>
            ) : null}
          </dd>
        </div>
      </dl>

      <div className="space-y-3">
        <Mark state="pass" label={`Verified on ${result.chainLabel}`} />
        <Mark state={result.proof} label="Cross-chain proof verified" />
        <Mark state={result.condition} label={result.conditionLabel} />
      </div>

      {result.footnote ? (
        <p className="max-w-xl text-[14px] leading-6 text-mute">{result.footnote}</p>
      ) : null}

      {result.settlementTx ? (
        <a
          href={`${SETTLEMENT.explorer}/tx/${result.settlementTx}`}
          className="block text-[13px] text-accent hover:text-ink"
          target="_blank"
          rel="noreferrer"
        >
          Creditcoin tx {shortenHash(result.settlementTx, 8)}
        </a>
      ) : null}
    </div>
  );
}
