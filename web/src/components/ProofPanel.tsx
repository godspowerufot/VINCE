"use client";

import { useState } from "react";
import { shortenHash } from "@/lib/hash";
import type { ContinuityProofView, MerkleProofView } from "@/lib/protocol/types";

export function ProofPanel({
  merkle,
  continuity,
}: {
  merkle: MerkleProofView | null;
  continuity: ContinuityProofView | null;
}) {
  const [open, setOpen] = useState(true);
  if (!merkle || !continuity) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-[12px] text-mute">Merkle inclusion</p>
          <p className="mt-1 text-[15px]">
            {merkle.siblings.length} sibling
            {merkle.siblings.length === 1 ? "" : "s"}
          </p>
          <p className="mt-2 break-all text-[12px] text-mute">
            root {shortenHash(merkle.root, 8)}
          </p>
        </div>
        <div>
          <p className="text-[12px] text-mute">Continuity</p>
          <p className="mt-1 text-[15px]">
            {continuity.roots.length} root
            {continuity.roots.length === 1 ? "" : "s"}
          </p>
          <p className="mt-2 break-all text-[12px] text-mute">
            digest {shortenHash(continuity.lowerEndpointDigest, 8)}
          </p>
        </div>
      </div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="text-[13px] text-mute transition-colors duration-200 hover:text-ink"
      >
        {open ? "Hide proof bytes" : "Show proof bytes"}
      </button>
      {open ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <ul className="max-h-56 space-y-2 overflow-auto text-[12px] leading-5">
            {merkle.siblings.map((sibling, index) => (
              <li key={`${sibling.hash}-${index}`} className="break-all">
                <span className="text-mute">
                  {index} {sibling.isLeft ? "L" : "R"}
                </span>{" "}
                {sibling.hash}
              </li>
            ))}
          </ul>
          <ul className="max-h-56 space-y-2 overflow-auto text-[12px] leading-5">
            <li className="break-all">
              <span className="text-mute">lower</span>{" "}
              {continuity.lowerEndpointDigest}
            </li>
            {continuity.roots.map((root, index) => (
              <li key={`${root}-${index}`} className="break-all">
                <span className="text-mute">{index}</span> {root}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
