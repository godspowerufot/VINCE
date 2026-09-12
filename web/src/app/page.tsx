import Link from "next/link";
import { AppShell, Split } from "@/components/AppShell";
import { readMarkets, readWindow } from "@/lib/protocol/settlementRead";

export default async function LandingPage() {
  const listed = await readMarkets();
  const windowState = await readWindow();

  return (
    <AppShell active="home">
      <Split
        left={
          <div className="flex h-full max-w-lg flex-col">
            <h1 className="font-display text-[2.4rem] font-medium leading-[1.12] tracking-[-0.03em] md:text-[3rem]">
              Paste a real Ethereum market print.
            </h1>
            <p className="mt-6 text-[17px] leading-7 text-mute">
              Creditcoin verifies it happened. VINCE issues a receipt. The
              product stops at attestation.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/gate"
                className="inline-flex h-11 items-center rounded-[14px] bg-accent px-5 text-[14px] font-medium text-on-accent transition-colors duration-200 hover:bg-accent-deep"
              >
                Open the gate
              </Link>
              <Link
                href="/receipt"
                className="text-[14px] text-mute transition-colors duration-200 hover:text-ink"
              >
                Open a receipt
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
                  Attestcoin proves inclusion. No wallet required.
                </li>
                <li>
                  <span className="block text-ink">Take the receipt</span>
                  Share the proved print. That is the end of the flow.
                </li>
              </ol>
            </div>
            <div>
              <h2 className="font-display text-[18px] font-medium tracking-[-0.02em]">
                Listed on-chain
              </h2>
              {listed.markets.length === 0 ? (
                <p className="mt-5 text-[15px] leading-6 text-mute">
                  {listed.error ?? "No markets listed. Owner must list an aggregator. Paste does not add a row."}
                </p>
              ) : (
                <ul className="mt-5 space-y-4 text-[15px]">
                  {listed.markets.map((market) => {
                    const attested =
                      windowState.window?.emitter?.toLowerCase() ===
                      market.feedAggregator?.toLowerCase()
                        ? windowState.window.observedHuman
                        : null;
                    return (
                      <li key={market.id}>
                        <div className="flex items-baseline justify-between gap-6">
                          <span>{market.display}</span>
                          <span className="text-mute">{market.floor}</span>
                        </div>
                        <p className="mt-1 text-[13px] text-mute">
                          {market.liveRpcHuman ? (
                            <>
                              RPC latest{" "}
                              <span className="tabular-nums text-ink">
                                {market.liveRpcHuman}
                              </span>{" "}
                              · not attested
                            </>
                          ) : (
                            "RPC latest unavailable"
                          )}
                          {attested ? (
                            <>
                              {" "}
                              · attested{" "}
                              <span className="tabular-nums text-ink">{attested}</span>
                            </>
                          ) : null}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="mt-6 text-[13px] leading-6 text-mute">
                RPC latest is an Ethereum read. It cannot PASS. Only a proven
                feed-update can.
              </p>
            </div>
          </div>
        }
      />
    </AppShell>
  );
}
