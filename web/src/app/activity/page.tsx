import Link from "next/link";
import { AppShell, Split } from "@/components/AppShell";
import { ACTIVITY_SEED } from "@/lib/fixtures";
import { shortenHash } from "@/lib/hash";

export default function ActivityPage() {
  return (
    <AppShell active="activity">
      <Split
        left={
          <div className="max-w-lg">
            <h1 className="font-display text-[2rem] font-medium tracking-[-0.03em]">
              Activity
            </h1>
            <p className="mt-3 text-[15px] leading-6 text-mute">
              Measured Phase 2 prints. Preview catalog, not a wallet history.
              Open one on the gate to see proof and policy as two lines.
            </p>
          </div>
        }
        right={
          <ul className="max-w-lg divide-y divide-line">
            {ACTIVITY_SEED.map((item) => (
              <li key={item.tx} className="py-6 first:pt-0">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-display text-[18px] font-medium tracking-[-0.02em]">
                    {item.market}
                  </p>
                  <p className="text-[13px] text-mute">
                    {item.decision === "PASS" ? "PASS" : item.reasons[0]}
                  </p>
                </div>
                <p className="mt-2 text-[13px] text-mute">
                  Proof {item.proof === "pass" ? "verified" : "failed"} ·{" "}
                  {item.conditionLabel}
                </p>
                <p className="mt-1 text-[13px] text-mute">
                  {shortenHash(item.tx, 8)}
                </p>
                <Link
                  href={`/gate?tx=${item.tx}`}
                  className="mt-3 inline-block text-[13px] text-accent transition-colors duration-200 hover:text-ink"
                >
                  Open on the gate
                </Link>
              </li>
            ))}
          </ul>
        }
      />
    </AppShell>
  );
}
