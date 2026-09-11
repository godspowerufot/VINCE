"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useSyncExternalStore } from "react";
import { Contract, Interface } from "ethers";
import { AdvancedPanel } from "@/components/AdvancedPanel";
import { Split } from "@/components/AppShell";
import { HashField } from "@/components/HashField";
import { HelpDrawer } from "@/components/HelpDrawer";
import { ProofPanel } from "@/components/ProofPanel";
import { StageStatus } from "@/components/StageStatus";
import { Verdict } from "@/components/Verdict";
import { WindowClock } from "@/components/WindowClock";
import { EXAMPLE_TX } from "@/lib/fixtures";
import { classifyHash } from "@/lib/hash";
import { ENGINE_ABI, GATE_ABI } from "@/lib/protocol/abi";
import { PROTOCOL, protocolDeployed } from "@/lib/protocol/deployments";
import type { ListedMarket, ObserveEvent, ObserveResult, PolicyReason } from "@/lib/protocol/types";
import { runObserve } from "@/lib/protocol/runObserve";
import { useProtocolStatus } from "@/lib/protocol/useProtocolStatus";
import { connectSepolia } from "@/lib/protocol/wallet";
import {
  getServerWindow,
  readWindow,
  subscribeWindow,
  writeWindow,
} from "@/lib/windowStore";

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
  const [submitting, setSubmitting] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ObserveResult | null>(null);
  const live = useSyncExternalStore(subscribeWindow, readWindow, getServerWindow);
  const abortRef = useRef<AbortController | null>(null);
  const started = useRef(0);
  const deployed = protocolDeployed();
  const protocol = useProtocolStatus();
  const listed = protocol.markets.length > 0 ? protocol.markets : markets;

  const kind = classifyHash(tx);
  const canVerify = kind === "tx" && !busy && !submitting;

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
      if (out.decision === "PASS") {
        writeWindow({
          market: out.market,
          tx: out.tx,
          observedHuman: out.observedHuman ?? "—",
        });
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Verification unavailable. Fail closed.");
      }
    } finally {
      window.clearInterval(tick);
      setBusy(false);
    }
  }

  async function onSubmit() {
    if (
      !result?.submitReady ||
      !PROTOCOL.gate ||
      !result.merkleProof?.root ||
      !result.continuityProof?.lowerEndpointDigest ||
      !result.answer ||
      result.advanced.verifySingle !== true
    ) {
      setError("Attestation is required before Sepolia policy. Fail closed.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { provider } = await connectSepolia();
      const signer = await provider.getSigner();
      const gate = new Contract(PROTOCOL.gate, GATE_ABI, signer);
      const sent = await gate.submitAttestedFeedUpdate(
        result.tx,
        result.chainKey,
        result.advanced.emitter,
        BigInt(result.answer),
        result.updatedAt,
        result.merkleProof.root,
        result.continuityProof.lowerEndpointDigest,
      );
      const receipt = await sent.wait();
      const iface = new Interface(ENGINE_ABI);
      let decision: "PASS" | "REJECT" = result.decision;
      let reasons: PolicyReason[] = result.reasons;
      for (const log of receipt?.logs ?? []) {
        try {
          const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
          if (parsed?.name === "DecisionEmitted") {
            decision = Number(parsed.args.decision) === 1 ? "PASS" : "REJECT";
            reasons = parsed.args.reasons as PolicyReason[];
          }
        } catch {
          continue;
        }
      }
      const pass = decision === "PASS";
      const next: ObserveResult = {
        ...result,
        preview: false,
        settlementTx: receipt?.hash ?? sent.hash,
        decision,
        reasons: pass ? ["PASS"] : reasons,
        condition: pass ? "pass" : "fail",
        conditionLabel: pass
          ? "Market condition satisfied"
          : reasons[0] ?? result.conditionLabel,
      };
      setResult(next);
      if (pass) {
        writeWindow({
          market: next.market,
          tx: next.tx,
          observedHuman: next.observedHuman ?? "—",
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not submit Sepolia policy. Fail closed.",
      );
    } finally {
      setSubmitting(false);
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
            Ethereum source · Attestcoin proof · Sepolia policy
          </p>

          <form
            className="mt-10 space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              void onVerify();
            }}
          >
            <HashField value={tx} onChange={setTx} disabled={busy || submitting} />
            <ul className="space-y-1 text-[12px] leading-5 text-mute">
              {listed.map((market) => (
                <li key={market.id}>
                  {market.display}
                  {market.ready ? `  ${market.floor}` : `  ${market.note ?? "not sourced"}`}
                  {"lastPrice" in market && market.lastPrice
                    ? `  attested ${market.lastPrice}`
                    : ""}
                  {"windowLive" in market && market.windowLive ? "  PASS" : ""}
                </li>
              ))}
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
            <div className="space-y-10">
              <Verdict result={result} />
              <ProofPanel merkle={result.merkleProof} continuity={result.continuityProof} />
              {result.decision === "PASS" && live ? (
                <WindowClock live={live} />
              ) : null}
              {deployed ? (
                <button
                  type="button"
                  onClick={() => void onSubmit()}
                  disabled={submitting || !result.submitReady}
                  className="inline-flex h-11 items-center rounded-[14px] border border-line bg-surface px-5 text-[14px] font-medium text-ink transition-colors duration-200 hover:border-accent disabled:text-mute"
                >
                  {submitting ? "Submitting Sepolia policy…" : "Submit Sepolia policy"}
                </button>
              ) : (
                <p className="text-[13px] text-mute">
                  Proofs are live. Sepolia policy is not deployed on this build, so
                  the window is preview-only.
                </p>
              )}
              {result.decision === "PASS" ? (
                <Link
                  href="/vault"
                  className="inline-flex h-11 items-center rounded-[14px] bg-accent px-5 text-[14px] font-medium text-on-accent transition-colors duration-200 hover:bg-accent-deep"
                >
                  Continue to vault
                </Link>
              ) : (
                <p className="text-[13px] text-mute">
                  Continue stays closed until PASS.
                </p>
              )}
              <AdvancedPanel result={result} />
            </div>
          ) : null}

          {!busy && !error && !result ? (
            <div className="text-[15px] leading-7 text-mute">
              <p className="text-ink">Result lands here.</p>
              <p className="mt-4">
                Paste a listed feed-update on the left. You will see two proofs
                (Merkle inclusion and continuity) and two verdicts: whether the
                print was proved, and whether that market’s rule passed.
              </p>
            </div>
          ) : null}
        </div>
      }
    />
  );
}
