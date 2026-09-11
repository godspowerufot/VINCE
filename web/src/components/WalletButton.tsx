"use client";

import { useEffect, useState } from "react";
import { shortenHash } from "@/lib/hash";
import { connectSepolia } from "@/lib/protocol/wallet";

export function WalletButton() {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const ethereum = (
      window as Window & {
        ethereum?: { request: (args: { method: string }) => Promise<unknown> };
      }
    ).ethereum;
    if (!ethereum) return;
    void ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        const list = accounts as string[];
        if (list[0]) setAddress(list[0]);
      })
      .catch(() => undefined);
  }, []);

  if (address) {
    return (
      <p className="text-[12px] leading-5 text-mute">
        {shortenHash(address, 4)}
        <span className="block">Sepolia</span>
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
          void connectSepolia()
            .then(({ address: next }) => setAddress(next))
            .catch((err: unknown) =>
              setError(err instanceof Error ? err.message : "Connect failed."),
            )
            .finally(() => setBusy(false));
        }}
        className="inline-flex h-10 items-center rounded-[14px] border border-line bg-surface px-4 text-[13px] font-medium text-ink transition-colors duration-200 hover:border-accent disabled:text-mute"
      >
        {busy ? "Connecting…" : "Connect Sepolia"}
      </button>
      {error ? <p className="mt-2 text-[12px] leading-5 text-danger">{error}</p> : null}
    </div>
  );
}
