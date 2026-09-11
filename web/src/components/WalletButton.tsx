"use client";

import { useEffect, useState } from "react";
import { shortenHash } from "@/lib/hash";
import { SETTLEMENT } from "@/lib/protocol/constants";
import { connectSettlement, walletError } from "@/lib/protocol/wallet";

type Injected = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

export function WalletButton() {
  const [address, setAddress] = useState<string | null>(null);
  const [onSettlement, setOnSettlement] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const ethereum = (window as Window & { ethereum?: Injected }).ethereum;
    if (!ethereum) return;

    async function sync() {
      const accounts = (await ethereum!.request({ method: "eth_accounts" })) as string[];
      const chainId = (await ethereum!.request({ method: "eth_chainId" })) as string;
      setAddress(accounts[0] ?? null);
      setOnSettlement(Number.parseInt(chainId, 16) === SETTLEMENT.chainId);
    }

    const onAccounts = () => void sync();
    const onChain = () => void sync();
    void sync().catch(() => undefined);
    ethereum.on?.("accountsChanged", onAccounts);
    ethereum.on?.("chainChanged", onChain);
    return () => {
      ethereum.removeListener?.("accountsChanged", onAccounts);
      ethereum.removeListener?.("chainChanged", onChain);
    };
  }, []);

  if (address && onSettlement) {
    return (
      <p className="text-[12px] leading-5 text-mute">
        {shortenHash(address, 4)}
        <span className="block">Creditcoin</span>
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          setError(null);
          void connectSettlement()
            .then(({ address: next }) => {
              setAddress(next);
              setOnSettlement(true);
            })
            .catch((err: unknown) => setError(walletError(err)))
            .finally(() => setBusy(false));
        }}
        className="inline-flex h-10 items-center rounded-[14px] border border-line bg-surface px-4 text-[13px] font-medium text-ink transition-colors duration-200 hover:border-accent disabled:text-mute"
      >
        {busy ? "Connecting…" : "Connect Creditcoin"}
      </button>
      {error ? <p className="mt-2 text-[12px] leading-5 text-danger">{error}</p> : null}
    </div>
  );
}
