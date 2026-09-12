"use client";

import { useEffect, useState } from "react";
import { Contract } from "ethers";
import { AppShell, Split } from "@/components/AppShell";
import { REGISTRY_ABI } from "@/lib/protocol/abi";
import { SETTLEMENT } from "@/lib/protocol/constants";
import { PROTOCOL, protocolDeployed } from "@/lib/protocol/deployments";
import { floorLabel } from "@/lib/protocol/markets";
import { useProtocolStatus } from "@/lib/protocol/useProtocolStatus";
import type { ListedMarket } from "@/lib/protocol/types";
import { connectSettlement, sendSettlementTx, walletError } from "@/lib/protocol/wallet";
import { shortenHash } from "@/lib/hash";

const OWNER = PROTOCOL.deployer;

export default function MarketsPage() {
  const deployed = protocolDeployed();
  const status = useProtocolStatus();
  const [markets, setMarkets] = useState<ListedMarket[]>([]);
  const [owner, setOwner] = useState<string | null>(OWNER);
  const [me, setMe] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [listTx, setListTx] = useState<string | null>(null);
  const [listPhase, setListPhase] = useState<
    "idle" | "wallet" | "pending" | "confirmed" | "reverted"
  >("idle");
  const [busy, setBusy] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [aggregator, setAggregator] = useState("");
  const [floor, setFloor] = useState("");

  const isOwner = Boolean(owner && me && owner.toLowerCase() === me.toLowerCase());
  const rows = markets.length > 0 ? markets : status.markets;

  async function loadOwner() {
    if (!PROTOCOL.registry) throw new Error("Registry is not deployed.");
    const { provider, address } = await connectSettlement();
    const registry = new Contract(PROTOCOL.registry, REGISTRY_ABI, provider);
    const [listed, registryOwner] = await Promise.all([
      registry.listedMarkets(),
      registry.owner(),
    ]);
    setOwner(registryOwner);
    setMe(address);
    setMarkets(
      listed
        .filter((row: { listed: boolean }) => row.listed)
        .map(
          (row: {
            id: string;
            displayName: string;
            minimumPrice: bigint;
            paused: boolean;
            feedAggregator: string;
          }) => ({
            id: row.id,
            display: row.displayName,
            floor: floorLabel(row.minimumPrice),
            ready: !row.paused,
            note: row.paused ? "paused" : null,
            feedAggregator: row.feedAggregator,
            minimumPrice: row.minimumPrice.toString(),
          }),
        ),
    );
  }

  useEffect(() => {
    if (status.markets.length === 0) return;
    setMarkets((prev) => (prev.length > status.markets.length ? prev : status.markets));
  }, [status.markets]);

  return (
    <AppShell active="markets">
      <Split
        left={
          <div className="max-w-lg">
            <h1 className="font-display text-[2rem] font-medium tracking-[-0.03em]">
              Markets
            </h1>
            <p className="mt-3 text-[15px] leading-6 text-mute">
              Listed Ethereum feeds from VinceRegistry. Identity is the aggregator
              address, never the ticker. Paste on the gate never lists a feed.
              Only the registry owner can call listMarket.
            </p>
            <dl className="mt-8 space-y-3 text-[13px] leading-5">
              <div>
                <dt className="text-mute">Registry owner</dt>
                <dd className="mt-1 break-all text-ink">
                  {owner ?? OWNER ?? "unknown"}
                </dd>
              </div>
              <div>
                <dt className="text-mute">Connected wallet</dt>
                <dd className="mt-1 break-all text-ink">{me ?? "not connected"}</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                disabled={!deployed || busy}
                onClick={() => {
                  setBusy(true);
                  setMessage(null);
                  void loadOwner()
                    .then(() =>
                      setMessage(
                        "Wallet connected. List market is owner-only.",
                      ),
                    )
                    .catch((err: unknown) =>
                      setMessage(err instanceof Error ? err.message : "Could not load registry."),
                    )
                    .finally(() => setBusy(false));
                }}
                className="inline-flex h-11 items-center rounded-[14px] border border-line bg-surface px-5 text-[14px] font-medium text-ink transition-colors duration-200 hover:border-accent disabled:text-mute"
              >
                Connect owner wallet
              </button>
            </div>
            <p className="mt-4 text-[13px] text-mute">
              Source: {status.source === "registry" ? "VinceRegistry" : "none"}
            </p>
          </div>
        }
        right={
          <div className="max-w-lg space-y-10">
            {rows.length === 0 ? (
              <p className="text-[15px] leading-6 text-mute">
                No markets listed. Unlisted emitters{" "}
                <span className="text-ink">REJECT_FEED</span>. Owner lists a sourced
                aggregator; paste does not add a row.
              </p>
            ) : (
            <ul className="divide-y divide-line">
              {rows.map((market) => {
                const lastPrice =
                  "lastPrice" in market
                    ? (market as { lastPrice?: string | null }).lastPrice
                    : null;
                const windowLive =
                  "windowLive" in market
                    ? Boolean((market as { windowLive?: boolean }).windowLive)
                    : false;
                return (
                  <li key={market.id} className="py-5 first:pt-0">
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="font-display text-[18px] font-medium tracking-[-0.02em]">
                        {market.display}
                      </p>
                      <p className="text-[13px] text-mute">
                        {windowLive
                          ? "PASS"
                          : market.ready
                            ? market.floor
                            : market.note}
                      </p>
                    </div>
                    {market.ready ? (
                      <p className="mt-2 text-[13px] text-mute">
                        Floor {market.floor}
                        {market.liveRpcHuman ? (
                          <>
                            {" "}
                            · RPC latest{" "}
                            <span className="tabular-nums text-ink">
                              {market.liveRpcHuman}
                            </span>{" "}
                            (not attested)
                          </>
                        ) : null}
                        {lastPrice ? (
                          <>
                            {" "}
                            · attested{" "}
                            <span className="tabular-nums text-ink">{lastPrice}</span>
                          </>
                        ) : null}
                      </p>
                    ) : null}
                    {market.feedAggregator ? (
                      <p className="mt-2 text-[12px] text-mute">
                        {shortenHash(market.feedAggregator, 8)}
                      </p>
                    ) : (
                      <p className="mt-2 text-[12px] text-mute">
                        Aggregator not sourced. Do not invent it.
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
            )}

            {isOwner ? (
              <form
                className="space-y-5 border-t border-line pt-8"
                onSubmit={(event) => {
                  event.preventDefault();
                  setBusy(true);
                  setMessage(null);
                  setListPhase("wallet");
                  void (async () => {
                    if (!PROTOCOL.registry) throw new Error("Registry is not deployed.");
                    const feed = aggregator.trim();
                    if (!/^0x[0-9a-fA-F]{40}$/.test(feed)) {
                      throw new Error("Feed aggregator must be a 20-byte Ethereum address.");
                    }
                    const { signer, address } = await connectSettlement();
                    if (owner && address.toLowerCase() !== owner.toLowerCase()) {
                      throw new Error(
                        `This wallet is not the registry owner. Connect ${owner}.`,
                      );
                    }
                    const registry = new Contract(PROTOCOL.registry, REGISTRY_ABI, signer);
                    const dollars = Number(floor);
                    if (!Number.isFinite(dollars) || dollars <= 0) {
                      throw new Error("Floor must be a USD number.");
                    }
                    const minimumPrice = BigInt(Math.round(dollars * 1e8));
                    const data = registry.interface.encodeFunctionData("listMarket", [
                      id.trim(),
                      3,
                      1,
                      feed,
                      minimumPrice,
                      3600,
                      name.trim(),
                    ]);
                    const sent = await sendSettlementTx(signer, {
                      from: address,
                      to: PROTOCOL.registry,
                      data,
                    });
                    setListTx(sent.hash);
                    setListPhase("pending");
                    setMessage("Submitted listMarket. Waiting for Creditcoin…");
                    const receipt = await sent.wait();
                    const hash = receipt?.hash ?? sent.hash;
                    setListTx(hash);
                    if (receipt && receipt.status === 0) {
                      setListPhase("reverted");
                      throw new Error(
                        "Creditcoin included the tx, but listMarket reverted. The feed was not listed.",
                      );
                    }
                    if (!receipt) {
                      setMessage(
                        "Submitted. Creditcoin receipt is not back yet — open the tx link.",
                      );
                      return;
                    }
                    await loadOwner();
                    setListPhase("confirmed");
                    setMessage(`Listed ${name.trim()}.`);
                    setId("");
                    setName("");
                    setAggregator("");
                    setFloor("");
                  })()
                    .catch((err: unknown) => {
                      setMessage(walletError(err));
                    })
                    .finally(() => setBusy(false));
                }}
              >
                <h2 className="font-display text-[18px] font-medium tracking-[-0.02em]">
                  List a feed
                </h2>
                <p className="text-[13px] leading-5 text-mute">
                  Owner only. Use a sourced Ethereum aggregator. Floor is USD, stored
                  at 8 decimals.
                </p>
                <Field label="id" value={id} onChange={setId} placeholder="eth-googl-usd" />
                <Field label="Display name" value={name} onChange={setName} placeholder="GOOGL/USD" />
                <Field
                  label="Feed aggregator"
                  value={aggregator}
                  onChange={setAggregator}
                  placeholder="0x…"
                />
                <Field label="Minimum USD" value={floor} onChange={setFloor} placeholder="250" />
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex h-11 items-center rounded-[14px] bg-accent px-5 text-[14px] font-medium text-on-accent transition-colors duration-200 hover:bg-accent-deep disabled:bg-line disabled:text-mute"
                >
                  {listPhase === "wallet"
                    ? "Confirm in wallet…"
                    : listPhase === "pending"
                      ? "Waiting for Creditcoin…"
                      : "List market"}
                </button>
              </form>
            ) : deployed ? (
              <p className="text-[13px] leading-6 text-mute">
                {me
                  ? "This wallet is not the registry owner. listMarket will revert."
                  : "Connect the registry owner to list a sourced Ethereum feed. Do not paste a ticker."}
              </p>
            ) : (
              <p className="text-[13px] leading-6 text-mute">
                Registry is not deployed on Creditcoin yet.
              </p>
            )}
            {listTx ? (
              <a
                href={`${SETTLEMENT.explorer}/tx/${listTx}`}
                className="block text-[13px] text-accent hover:text-ink"
                target="_blank"
                rel="noreferrer"
              >
                {listPhase === "pending"
                  ? "Submitted"
                  : listPhase === "reverted"
                    ? "Reverted"
                    : "Listed"}{" "}
                tx {shortenHash(listTx, 8)}
              </a>
            ) : null}
            {message ? <p className="text-[13px] text-mute">{message}</p> : null}
          </div>
        }
      />
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[13px] text-mute">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[14px] border border-line bg-surface px-4 py-3.5 text-[15px] outline-none"
      />
    </label>
  );
}
