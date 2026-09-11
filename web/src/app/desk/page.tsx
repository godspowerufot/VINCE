"use client";

import Link from "next/link";
import { useState } from "react";
import { Contract } from "ethers";
import { AppShell, Split } from "@/components/AppShell";
import { WindowClock } from "@/components/WindowClock";
import { shortenHash } from "@/lib/hash";
import { DESK_ABI } from "@/lib/protocol/abi";
import { ATTESTCOIN, CREDITCOIN, SETTLEMENT } from "@/lib/protocol/constants";
import { PROTOCOL, deskDeployed } from "@/lib/protocol/deployments";
import { useProtocolStatus } from "@/lib/protocol/useProtocolStatus";
import { connectSettlement, sendSettlementTx, walletError } from "@/lib/protocol/wallet";

export default function DeskPage() {
  const status = useProtocolStatus();
  const deployed = deskDeployed();
  const [message, setMessage] = useState<string | null>(null);
  const [releaseTx, setReleaseTx] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const live = status.live && status.window;
  const clock = live
    ? {
        market: status.window!.market,
        tx: status.window!.txKey,
        observedHuman: status.window!.observedHuman,
        openedAt: status.window!.openedAt,
        until: status.window!.until,
      }
    : null;

  async function release() {
    if (!PROTOCOL.desk) {
      throw new Error("Desk is not deployed.");
    }
    if (!status.live) {
      throw new Error("No live PASS. Prove a listed print on the gate first.");
    }
    const { signer, address } = await connectSettlement();
    const desk = new Contract(PROTOCOL.desk, DESK_ABI, signer);
    const data = desk.interface.encodeFunctionData("releaseFinancing");
    const sent = await sendSettlementTx(signer, {
      from: address,
      to: PROTOCOL.desk,
      data,
    });
    const receipt = await sent.wait();
    setReleaseTx(receipt?.hash ?? sent.hash);
  }

  return (
    <AppShell active="desk">
      <Split
        left={
          <div className="max-w-lg">
            <h1 className="font-display text-[2rem] font-medium tracking-[-0.03em]">
              Creditcoin RWA desk
            </h1>
            <p className="mt-3 text-[15px] leading-6 text-mute">
              A Creditcoin app that may not release financing until Attestcoin
              proved the print and VINCE policy PASSed. Not a bank. Not a vault.
            </p>
            {clock ? (
              <div className="mt-10 space-y-3">
                <p className="text-[15px]">
                  <span className="text-mute">Market</span>
                  <span className="ml-3">{clock.market}</span>
                </p>
                <p className="text-[15px]">
                  <span className="text-mute">Attested print</span>
                  <span className="ml-3 tabular-nums">{clock.observedHuman}</span>
                </p>
                <WindowClock live={clock} />
                <p className="text-[13px] text-mute">
                  Source tx {shortenHash(clock.tx, 8)}
                </p>
              </div>
            ) : (
              <p className="mt-10 max-w-md text-[16px] leading-7 text-mute">
                Desk is locked. Paste a listed Ethereum feed-update on the gate,
                wait for Attestcoin <span className="text-ink">verifySingle</span>,
                then submit on Creditcoin.
              </p>
            )}
            <p className="mt-10 text-[12px] leading-5 text-mute">
              Attestcoin and VINCE policy on Creditcoin Testnet ({CREDITCOIN.chainId}).
              Source prints stay on Ethereum.
            </p>
          </div>
        }
        right={
          <div className="max-w-lg space-y-8">
            <ol className="space-y-4 text-[15px] leading-6 text-mute">
              <li>
                <span className="text-ink">1. Prove</span> — Attestcoin{" "}
                <code className="text-[13px]">verifySingle</code> at{" "}
                {shortenHash(ATTESTCOIN.prover, 4)}
              </li>
              <li>
                <span className="text-ink">2. Decide</span> — listed floor and
                freshness on VinceEngine
              </li>
              <li>
                <span className="text-ink">3. Act</span> — this desk may release
                financing only while PASS is live
              </li>
            </ol>

            {!deployed ? (
              <p className="text-[14px] leading-6 text-mute">
                VinceDesk is not deployed on Creditcoin yet.
              </p>
            ) : null}

            <button
              type="button"
              disabled={!deployed || !live || busy}
              onClick={() => {
                setBusy(true);
                setMessage(null);
                void release()
                  .then(() => setMessage("Financing released. This Creditcoin-style desk consumed PASS."))
                  .catch((err: unknown) => setMessage(walletError(err)))
                  .finally(() => setBusy(false));
              }}
              className="inline-flex h-11 items-center rounded-[14px] bg-accent px-5 text-[14px] font-medium text-on-accent transition-colors duration-200 hover:bg-accent-deep disabled:bg-line disabled:text-mute"
            >
              {busy ? "Releasing…" : "Release financing"}
            </button>

            {!live ? (
              <Link
                href="/gate"
                className="inline-flex h-11 items-center rounded-[14px] border border-line bg-surface px-5 text-[14px] font-medium text-ink transition-colors duration-200 hover:border-accent"
              >
                Open the gate
              </Link>
            ) : null}

            {releaseTx ? (
              <a
                href={`${SETTLEMENT.explorer}/tx/${releaseTx}`}
                className="block text-[13px] text-accent hover:text-ink"
                target="_blank"
                rel="noreferrer"
              >
                Desk tx {shortenHash(releaseTx, 8)}
              </a>
            ) : null}
            {message ? <p className="text-[13px] text-mute">{message}</p> : null}
          </div>
        }
      />
    </AppShell>
  );
}
