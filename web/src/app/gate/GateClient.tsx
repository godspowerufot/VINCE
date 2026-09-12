"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AdvancedPanel } from "@/components/AdvancedPanel";
import { ReceiptCard } from "@/components/ReceiptCard";
import { Split } from "@/components/AppShell";
import { HashField } from "@/components/HashField";
import { HelpDrawer } from "@/components/HelpDrawer";
import { StageStatus } from "@/components/StageStatus";
import { receiptPath } from "@/lib/protocol/receipt";
import { EXAMPLE_TX } from "@/lib/fixtures";
import { classifyHash } from "@/lib/hash";
import type { ListedMarket, ObserveEvent, ObserveResult } from "@/lib/protocol/types";
import { runObserve } from "@/lib/protocol/runObserve";
import { useProtocolStatus } from "@/lib/protocol/useProtocolStatus";

export function GateClient({
  initialTx,
  markets,
}: {
  initialTx?: string;
  markets: ListedMarket[];
}) {
  const router = useRouter();
  const [tx, setTx] = useState(initialTx ?? "");
  const [busy, setBusy] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ObserveResult | null>(null);
  const [origin, setOrigin] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const started = useRef(0);
  const protocol = useProtocolStatus();
  const listed = protocol.markets.length > 0 ? protocol.markets : markets;

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const kind = classifyHash(tx);
  const canVerify = kind === "tx" && !busy;

  async function onVerify() {
    if (!canVerify) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setError(null);
    setResult(null);
    setStageIndex(0);
    setElapsedMs(0);
    started.current = Date.now();
    const tick = window.setInterval(() => {
      setElapsedMs(Date.now() - started.current);
    }, 250);
    try {
      const out = await runObserve(
        tx,
        (event: ObserveEvent) => {
          if (event.type === "stage") setStageIndex(event.stageIndex);
        },
        controller.signal,
      );
      if ("error" in out) {
        setError(out.error);
        return;
      }
      setResult(out);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Verification unavailable. Fail closed.");
      }
    } finally {
      window.clearInterval(tick);
      setBusy(false);
    }
  }

  return (
    <Split
      left={
        <div className="flex h-full max-w-lg flex-col">
          <h1 className="font-display text-[2rem] font-medium tracking-[-0.03em]">
            Verified Market Gate
          </h1>
          <p className="mt-3 text-[15px] text-mute">
            Ethereum source · Attestcoin proof. The product stops at attestation.
          </p>

          <form
            className="mt-10 space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              void onVerify();
            }}
          >
            <HashField value={tx} onChange={setTx} disabled={busy} />
            <ul className="space-y-2 text-[12px] leading-5 text-mute">
              {protocol.loading && listed.length === 0 ? (
                <li>Reading VinceRegistry…</li>
              ) : null}
              {listed.map((market) => (
                <li key={market.id}>
                  {market.display}
                  {market.ready ? `  ${market.floor}` : `  ${market.note ?? "not sourced"}`}
                  {market.liveRpcHuman ? `  RPC ${market.liveRpcHuman}` : ""}
                </li>
              ))}
              {!protocol.loading && listed.length === 0 ? (
                <li>{protocol.error ?? "No listed markets on-chain."}</li>
              ) : null}
            </ul>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <button
                type="submit"
                disabled={!canVerify}
                className="inline-flex h-11 items-center rounded-[14px] bg-accent px-5 text-[14px] font-medium text-on-accent transition-colors duration-200 hover:bg-accent-deep disabled:bg-line disabled:text-mute"
              >
                Verify transaction
              </button>
              <button
                type="button"
                onClick={() => {
                  setTx(EXAMPLE_TX);
                  router.replace(`/gate?tx=${EXAMPLE_TX}`);
                }}
                className="text-[13px] text-mute transition-colors duration-200 hover:text-ink"
              >
                Find an example tx
              </button>
            </div>
          </form>

          <div className="mt-8">
            <HelpDrawer />
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
            <div className="space-y-8">
              <ReceiptCard result={result} shareOrigin={origin} />
              <Link
                href={receiptPath(result.tx, result.settlementTx)}
                className="inline-flex h-11 items-center rounded-[14px] border border-line bg-surface px-5 text-[14px] font-medium text-ink transition-colors duration-200 hover:border-accent"
              >
                Open standalone receipt
              </Link>
              <AdvancedPanel result={result} />
            </div>
          ) : null}

          {!busy && !error && !result ? (
            <div className="text-[15px] leading-7 text-mute">
              <p className="text-ink">The receipt lands here.</p>
              <p className="mt-4">
                After Attestcoin verifies the pasted tx you get a shareable
                receipt. That is the end of the product. There is no settlement
                step.
              </p>
            </div>
          ) : null}
        </div>
      }
    />
  );
}
