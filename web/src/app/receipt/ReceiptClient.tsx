"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ReceiptCard } from "@/components/ReceiptCard";
import { Split } from "@/components/AppShell";
import { StageStatus } from "@/components/StageStatus";
import { classifyHash } from "@/lib/hash";
import type { ObserveEvent, ObserveResult } from "@/lib/protocol/types";
import { runObserve } from "@/lib/protocol/runObserve";

export function ReceiptClient({
  initialTx,
  settlementTx,
}: {
  initialTx?: string;
  settlementTx?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ObserveResult | null>(null);
  const [origin, setOrigin] = useState("");
  const started = useRef(0);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const tx = initialTx?.trim() ?? "";
    if (classifyHash(tx) !== "tx") {
      setResult(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setBusy(true);
    setError(null);
    setResult(null);
    setStageIndex(0);
    setElapsedMs(0);
    started.current = Date.now();
    const tick = window.setInterval(() => {
      setElapsedMs(Date.now() - started.current);
    }, 250);

    void runObserve(
      tx,
      (event: ObserveEvent) => {
        if (event.type === "stage") setStageIndex(event.stageIndex);
      },
      controller.signal,
    )
      .then((out) => {
        if ("error" in out) {
          setError(out.error);
          return;
        }
        setResult({
          ...out,
          settlementTx: settlementTx ?? out.settlementTx,
        });
      })
      .catch((err) => {
        if ((err as Error).name !== "AbortError") {
          setError("Verification unavailable. Fail closed.");
        }
      })
      .finally(() => {
        window.clearInterval(tick);
        setBusy(false);
      });

    return () => {
      controller.abort();
      window.clearInterval(tick);
    };
  }, [initialTx, settlementTx]);

  const hasTx = classifyHash(initialTx ?? "") === "tx";

  return (
    <Split
      left={
        <div className="max-w-lg">
          <h1 className="font-display text-[2rem] font-medium tracking-[-0.03em]">
            Receipt
          </h1>
          <p className="mt-3 text-[15px] leading-6 text-mute">
            Shareable record that Attestcoin verified a pasted Ethereum
            feed-update. Not a token certificate. Not a trading license. Not a
            settlement.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            <Link
              href={hasTx && initialTx ? `/gate?tx=${initialTx}` : "/gate"}
              className="text-[14px] text-accent transition-colors duration-200 hover:text-ink"
            >
              Open on the gate
            </Link>
          </div>
        </div>
      }
      right={
        <div className="max-w-lg">
          {busy ? <StageStatus stageIndex={stageIndex} elapsedMs={elapsedMs} /> : null}
          {error && !busy ? (
            <p className="text-[15px] leading-6 text-danger">{error}</p>
          ) : null}
          {result && !busy ? (
            <ReceiptCard result={result} shareOrigin={origin} />
          ) : null}
          {!busy && !error && !result ? (
            <p className="text-[15px] leading-7 text-mute">
              {hasTx
                ? "Rebuilding the receipt from the source transaction…"
                : "Verify a feed-update on the gate first. The receipt is issued after attestation."}
            </p>
          ) : null}
        </div>
      }
    />
  );
}
