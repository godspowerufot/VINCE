"use client";

import { useId } from "react";
import { classifyHash } from "@/lib/hash";

export function HashField({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const kind = classifyHash(value);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-[13px] text-mute">
        Paste an Ethereum feed-update transaction
      </label>
      <input
        id={id}
        name="tx"
        value={value}
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
        placeholder="0x…"
        onChange={(event) => onChange(event.target.value.trim())}
        className="w-full rounded-[14px] border border-line bg-surface px-4 py-3.5 font-sans text-[15px] text-ink outline-none placeholder:text-mute/50 disabled:opacity-50"
      />
      {kind === "wallet" ? (
        <p className="text-[13px] text-danger">
          That looks like a wallet, not a transaction. Paste the 64-character
          hash of a feed-update.
        </p>
      ) : null}
      {kind === "invalid" && value.length > 0 ? (
        <p className="text-[13px] text-danger">
          Could not load that transaction. Use a 0x hash with 64 hex characters.
        </p>
      ) : null}
    </div>
  );
}
