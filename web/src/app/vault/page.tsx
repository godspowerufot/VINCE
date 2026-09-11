"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Contract, formatEther, parseEther } from "ethers";
import { AppShell, Split } from "@/components/AppShell";
import { WindowClock } from "@/components/WindowClock";
import { shortenHash } from "@/lib/hash";
import { VAULT_ABI, VUSD_ABI } from "@/lib/protocol/abi";
import { PROTOCOL, protocolDeployed } from "@/lib/protocol/deployments";
import { useProtocolStatus } from "@/lib/protocol/useProtocolStatus";
import { connectSepolia } from "@/lib/protocol/wallet";

type Position = {
  address: string;
  wallet: string;
  collateral: string;
  debt: string;
  limit: string;
  claimed: boolean;
};

function fmt(value: bigint): string {
  const n = Number(formatEther(value));
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function VaultPage() {
  const deployed = protocolDeployed();
  const status = useProtocolStatus();
  const [position, setPosition] = useState<Position | null>(null);
  const [deposit, setDeposit] = useState("1000");
  const [borrow, setBorrow] = useState("500");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const chainLive = status.live;
  const liveClock =
    chainLive && status.window
      ? {
          market: status.window.market,
          tx: status.window.txKey,
          observedHuman: status.window.observedHuman,
          openedAt: status.window.openedAt,
          until: status.window.until,
        }
      : null;

  async function withContracts() {
    if (!PROTOCOL.vault || !PROTOCOL.vusd) {
      throw new Error("Vault is not deployed.");
    }
    const { provider, address } = await connectSepolia();
    const signer = await provider.getSigner();
    const vault = new Contract(PROTOCOL.vault, VAULT_ABI, signer);
    const vusd = new Contract(PROTOCOL.vusd, VUSD_ABI, signer);
    return { address, vault, vusd };
  }

  async function load(
    vault: Contract,
    vusd: Contract,
    address: string,
  ): Promise<Position> {
    const [wallet, collateral, debt, limit, claimed] = await Promise.all([
      vusd.balanceOf(address),
      vault.collateral(address),
      vault.debt(address),
      vault.borrowLimitOf(address),
      vusd.claimed(address),
    ]);
    const next = {
      address,
      wallet: fmt(wallet),
      collateral: fmt(collateral),
      debt: fmt(debt),
      limit: fmt(limit),
      claimed: Boolean(claimed),
    };
    setPosition(next);
    return next;
  }

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(true);
    setMessage(null);
    try {
      await fn();
      setMessage(label);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Transaction failed.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!deployed) return;
    const ethereum = (
      window as Window & {
        ethereum?: { request: (args: { method: string }) => Promise<unknown> };
      }
    ).ethereum;
    if (!ethereum) return;
    void ethereum
      .request({ method: "eth_accounts" })
      .then(async (accounts) => {
        const list = accounts as string[];
        if (!list[0]) return;
        const { vault, vusd, address } = await withContracts();
        await load(vault, vusd, address);
      })
      .catch(() => undefined);
  }, [deployed]);

  return (
    <AppShell active="vault">
      <Split
        left={
          <div className="max-w-lg">
            <h1 className="font-display text-[2rem] font-medium tracking-[-0.03em]">
              Vault
            </h1>
            <p className="mt-3 text-[15px] leading-6 text-mute">
              Listed markets are price rules, not tokens you lend. Supply mock
              vUSD as collateral. Borrow vUSD only while a listed market has a
              live on-chain PASS window.
            </p>

            <div className="mt-8">
              {position ? (
                <p className="text-[13px] text-mute">
                  Connected {shortenHash(position.address, 4)} · Ethereum Sepolia
                </p>
              ) : (
                <button
                  type="button"
                  disabled={!deployed || busy}
                  onClick={() =>
                    void run("Connected.", async () => {
                      const { vault, vusd, address } = await withContracts();
                      await load(vault, vusd, address);
                    })
                  }
                  className="inline-flex h-11 items-center rounded-[14px] bg-accent px-5 text-[14px] font-medium text-on-accent transition-colors duration-200 hover:bg-accent-deep disabled:bg-line disabled:text-mute"
                >
                  Connect Sepolia
                </button>
              )}
            </div>

            {liveClock ? (
              <div className="mt-10 space-y-3">
                <p className="text-[15px]">
                  <span className="text-mute">Open market</span>
                  <span className="ml-3">{liveClock.market}</span>
                </p>
                <p className="text-[15px]">
                  <span className="text-mute">Attested</span>
                  <span className="ml-3 tabular-nums">{liveClock.observedHuman}</span>
                </p>
                <WindowClock live={liveClock} />
              </div>
            ) : (
              <p className="mt-10 max-w-md text-[16px] leading-7 text-mute">
                No live PASS window. Supply stays open. Borrow stays closed
                until you prove a listed feed-update on the gate and submit
                Sepolia policy.
              </p>
            )}

            {position ? (
              <dl className="mt-10 space-y-2 text-[14px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-mute">Wallet</dt>
                  <dd className="tabular-nums">{position.wallet} vUSD</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-mute">Supplied</dt>
                  <dd className="tabular-nums">{position.collateral} vUSD</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-mute">Borrowed</dt>
                  <dd className="tabular-nums">{position.debt} vUSD</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-mute">Borrow limit</dt>
                  <dd className="tabular-nums">{position.limit} vUSD</dd>
                </div>
              </dl>
            ) : null}
          </div>
        }
        right={
          <div className="max-w-lg space-y-10">
            <div>
              <h2 className="font-display text-[18px] font-medium tracking-[-0.02em]">
                Listed markets
              </h2>
              <p className="mt-2 text-[13px] leading-5 text-mute">
                {status.source === "registry"
                  ? "VinceRegistry on Sepolia"
                  : "Seed list until the registry answers"}
              </p>
              <ul className="mt-5 divide-y divide-line">
                {status.markets
                  .filter((market) => market.ready)
                  .map((market) => (
                  <li key={market.id} className="py-5 first:pt-0">
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="font-display text-[18px] font-medium tracking-[-0.02em]">
                        {market.display}
                      </p>
                      <p className="text-[13px] text-mute">
                        {market.windowLive
                          ? "PASS · borrow open"
                          : market.ready
                            ? "listed · window closed"
                            : market.note}
                      </p>
                    </div>
                    <p className="mt-2 text-[13px] text-mute">
                      Floor {market.floor}
                      {market.lastPrice ? (
                        <>
                          {" "}
                          · last attested{" "}
                          <span className="tabular-nums text-ink">{market.lastPrice}</span>
                        </>
                      ) : (
                        " · no attested print on this window"
                      )}
                    </p>
                    {market.feedAggregator ? (
                      <p className="mt-1 text-[12px] text-mute">
                        {shortenHash(market.feedAggregator, 8)}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>

            {!deployed ? (
              <p className="text-[14px] leading-6 text-mute">
                Vault is not deployed to Sepolia on this build.
              </p>
            ) : null}

            <div className="space-y-4">
              <button
                type="button"
                disabled={!position || busy || Boolean(position?.claimed)}
                onClick={() =>
                  void run("Faucet minted 1000 vUSD.", async () => {
                    const { vault, vusd, address } = await withContracts();
                    const tx = await vusd.faucet();
                    await tx.wait();
                    await load(vault, vusd, address);
                  })
                }
                className="text-[13px] text-mute transition-colors duration-200 hover:text-ink disabled:opacity-40"
              >
                {position?.claimed ? "Faucet already claimed" : "Claim 1000 vUSD faucet"}
              </button>
            </div>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void run("Supplied.", async () => {
                  const { vault, vusd, address } = await withContracts();
                  const amount = parseEther(deposit);
                  const allowance = await vusd.allowance(address, PROTOCOL.vault);
                  if (allowance < amount) {
                    const approve = await vusd.approve(PROTOCOL.vault, amount);
                    await approve.wait();
                  }
                  const tx = await vault.deposit(amount);
                  await tx.wait();
                  await load(vault, vusd, address);
                });
              }}
            >
              <label className="block space-y-2">
                <span className="text-[13px] text-mute">Supply vUSD</span>
                <input
                  inputMode="decimal"
                  value={deposit}
                  onChange={(event) => setDeposit(event.target.value)}
                  className="w-full rounded-[14px] border border-line bg-surface px-4 py-3.5 text-[15px] tabular-nums outline-none"
                />
              </label>
              <div className="flex flex-wrap gap-4">
                <button
                  type="submit"
                  disabled={!position || busy}
                  className="inline-flex h-11 items-center rounded-[14px] bg-accent px-5 text-[14px] font-medium text-on-accent transition-colors duration-200 hover:bg-accent-deep disabled:bg-line disabled:text-mute"
                >
                  Supply
                </button>
                <button
                  type="button"
                  disabled={!position || busy}
                  onClick={() =>
                    void run("Withdrawn.", async () => {
                      const { vault, vusd, address } = await withContracts();
                      const amount = parseEther(deposit);
                      const tx = await vault.withdraw(amount);
                      await tx.wait();
                      await load(vault, vusd, address);
                    })
                  }
                  className="inline-flex h-11 items-center rounded-[14px] border border-line bg-surface px-5 text-[14px] font-medium text-ink transition-colors duration-200 hover:border-accent disabled:text-mute"
                >
                  Withdraw
                </button>
              </div>
            </form>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void run("Borrowed.", async () => {
                  if (!chainLive) {
                    throw new Error("Borrow stays closed until an on-chain PASS window.");
                  }
                  const { vault, vusd, address } = await withContracts();
                  const tx = await vault.requestBorrow(parseEther(borrow));
                  await tx.wait();
                  await load(vault, vusd, address);
                });
              }}
            >
              <label className="block space-y-2">
                <span className="text-[13px] text-mute">Borrow vUSD</span>
                <input
                  inputMode="decimal"
                  value={borrow}
                  onChange={(event) => setBorrow(event.target.value)}
                  className="w-full rounded-[14px] border border-line bg-surface px-4 py-3.5 text-[15px] tabular-nums outline-none"
                />
              </label>
              <p className="text-[15px]">
                <span className="text-mute">On-chain limit</span>
                <span className="ml-3 tabular-nums">
                  {position ? position.limit : "—"} vUSD
                </span>
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  type="submit"
                  disabled={!position || busy || !chainLive}
                  className="inline-flex h-11 items-center rounded-[14px] bg-accent px-5 text-[14px] font-medium text-on-accent transition-colors duration-200 hover:bg-accent-deep disabled:bg-line disabled:text-mute"
                >
                  Borrow
                </button>
                <button
                  type="button"
                  disabled={!position || busy}
                  onClick={() =>
                    void run("Repaid.", async () => {
                      const { vault, vusd, address } = await withContracts();
                      const owed = await vault.debt(address);
                      if (owed === BigInt(0)) throw new Error("No debt.");
                      const allowance = await vusd.allowance(address, PROTOCOL.vault);
                      if (allowance < owed) {
                        const approve = await vusd.approve(PROTOCOL.vault, owed);
                        await approve.wait();
                      }
                      const tx = await vault.repay(owed);
                      await tx.wait();
                      await load(vault, vusd, address);
                    })
                  }
                  className="inline-flex h-11 items-center rounded-[14px] border border-line bg-surface px-5 text-[14px] font-medium text-ink transition-colors duration-200 hover:border-accent disabled:text-mute"
                >
                  Repay
                </button>
              </div>
              {!chainLive ? (
                <p className="text-[13px] leading-6 text-mute">
                  Prove a listed print on the{" "}
                  <Link href="/gate" className="text-accent hover:text-ink">
                    gate
                  </Link>
                  , then submit Sepolia policy to open borrow.
                </p>
              ) : null}
            </form>
            {message ? <p className="text-[13px] text-mute">{message}</p> : null}
          </div>
        }
      />
    </AppShell>
  );
}
