"use client";

import { useEffect, useState } from "react";
import { seedMarkets } from "./markets";
import type { ListedMarket } from "./types";
import type { ChainWindow, MarketsPayload, WindowPayload } from "./sepoliaRead";

export type VaultMarket = ListedMarket & {
  lastPrice: string | null;
  windowLive: boolean;
};

export type ProtocolStatus = {
  protocolDeployed: boolean;
  live: boolean;
  window: ChainWindow | null;
  markets: VaultMarket[];
  source: "seed" | "registry";
  loading: boolean;
};

function decorate(
  markets: ListedMarket[],
  live: boolean,
  chainWindow: ChainWindow | null,
): VaultMarket[] {
  const emitter = chainWindow?.emitter?.toLowerCase() ?? "";
  return markets.map((market) => {
    const match =
      Boolean(emitter) &&
      market.feedAggregator?.toLowerCase() === emitter;
    return {
      ...market,
      lastPrice: match ? chainWindow?.observedHuman ?? null : null,
      windowLive: Boolean(match && live),
    };
  });
}

export function useProtocolStatus(): ProtocolStatus {
  const [state, setState] = useState<ProtocolStatus>({
    protocolDeployed: false,
    live: false,
    window: null,
    markets: decorate(seedMarkets().filter((row) => row.ready), false, null),
    source: "seed",
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [marketsRes, windowRes] = await Promise.all([
          fetch("/api/markets"),
          fetch("/api/window"),
        ]);
        const marketsJson = (await marketsRes.json()) as MarketsPayload;
        const windowJson = (await windowRes.json()) as WindowPayload;
        if (cancelled) return;
        setState({
          protocolDeployed: Boolean(
            marketsJson.protocolDeployed && windowJson.protocolDeployed,
          ),
          live: Boolean(windowJson.live),
          window: windowJson.window,
          markets: decorate(
            marketsJson.markets,
            Boolean(windowJson.live),
            windowJson.window,
          ),
          source: marketsJson.source,
          loading: false,
        });
      } catch {
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false }));
        }
      }
    }

    void load();
    const id = window.setInterval(() => void load(), 15_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return state;
}
