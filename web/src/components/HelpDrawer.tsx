"use client";

import { useState } from "react";

export function HelpDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-[13px] text-mute transition-colors duration-200 hover:text-ink"
      >
        Where do I get a transaction?
      </button>
      {open ? (
        <div className="mt-5 max-w-xl space-y-4 text-[14px] leading-6 text-mute">
          <p className="text-ink">
            VINCE does not pick a print for you. You point at one.
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Open an Ethereum Chainlink feed-update. Only owner-listed aggregators can PASS.</li>
            <li>Open a recent update on the block explorer.</li>
            <li>Copy the transaction hash — 64 hex characters after 0x.</li>
            <li>Return here and paste it.</li>
          </ol>
          <p>
            Do not paste a wallet address, a Base TSLAc swap, or a Uniswap fill.
            VINCE prices Chainlink updates on Ethereum. Base is not an
            Attestcoin source yet.
          </p>
        </div>
      ) : null}
    </div>
  );
}
