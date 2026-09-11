import Link from "next/link";
import { AppShell, Split } from "@/components/AppShell";
import { seedMarkets } from "@/lib/protocol/markets";

export default function LandingPage() {
  return (
    <AppShell active="home">
      <Split
        left={
          <div className="flex h-full max-w-lg flex-col">
            <h1 className="font-display text-[2.4rem] font-medium leading-[1.12] tracking-[-0.03em] md:text-[3rem]">
              Paste a real Ethereum market print.
            </h1>
            <p className="mt-6 text-[17px] leading-7 text-mute">
              Creditcoin verifies it happened. VINCE decides on Sepolia if that
              listed market’s rule passed. Proof and PASS are different.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/gate"
                className="inline-flex h-11 items-center rounded-[14px] bg-accent px-5 text-[14px] font-medium text-on-accent transition-colors duration-200 hover:bg-accent-deep"
              >
                Open the gate
              </Link>
              <Link
                href="/vault"
                className="text-[14px] text-mute transition-colors duration-200 hover:text-ink"
              >
                Open the vault
              </Link>
            </div>
            <p className="mt-auto hidden pt-16 text-[12px] text-mute lg:block">
              You point at a transaction. VINCE does not hunt for one.
            </p>
          </div>
        }
        right={
          <div className="flex h-full max-w-md flex-col gap-14">
            <div>
              <h2 className="font-display text-[18px] font-medium tracking-[-0.02em]">
                How it works
              </h2>
              <ol className="mt-5 space-y-5 text-[15px] leading-6 text-mute">
                <li>
                  <span className="block text-ink">Copy a feed-update</span>
                  Chainlink on Ethereum. 64 hex characters. Not a wallet.
                </li>
                <li>
                  <span className="block text-ink">Paste it on the gate</span>
                  We prove inclusion on Creditcoin. Wallet is later.
                </li>
                <li>
                  <span className="block text-ink">Read two results</span>
                  Proof verified. Then whether that listed market’s rule passed.
                </li>
              </ol>
            </div>
            <div>
              <h2 className="font-display text-[18px] font-medium tracking-[-0.02em]">
                Listed now
              </h2>
              <ul className="mt-5 space-y-3 text-[15px]">
                {seedMarkets().map((market) => (
                  <li
                    key={market.id}
                    className="flex items-baseline justify-between gap-6"
                  >
                    <span>{market.display}</span>
                    <span className="text-mute">
                      {market.ready ? market.floor : market.note}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[13px] leading-6 text-mute">
                GOOGL and SPCX can be proved. Pasting does not list them. After
                PASS, supply and borrow mock vUSD on the vault.
              </p>
            </div>
          </div>
        }
      />
    </AppShell>
  );
}
