import { Contract, JsonRpcProvider } from "ethers";
import { ENGINE_ABI, REGISTRY_ABI } from "./abi";
import { SEPOLIA } from "./constants";
import { PROTOCOL, protocolDeployed } from "./deployments";
import { floorLabel, formatUsd8, seedMarkets } from "./markets";
import type { ListedMarket } from "./types";

export type ChainWindow = {
  market: string;
  txKey: string;
  observedHuman: string;
  until: number;
  openedAt: number;
  emitter: string;
};

export type MarketsPayload = {
  source: "seed" | "registry";
  markets: ListedMarket[];
  protocolDeployed: boolean;
  error?: string;
};

export type WindowPayload = {
  live: boolean;
  protocolDeployed: boolean;
  window: ChainWindow | null;
  error?: boolean;
};

function provider() {
  return new JsonRpcProvider(SEPOLIA.rpc, SEPOLIA.chainId, {
    staticNetwork: true,
  });
}

function mapRows(rows: {
  listed: boolean;
  paused: boolean;
  id: string;
  displayName: string;
  feedAggregator: string;
  minimumPrice: bigint;
  sourceChainKey: bigint;
  maxAgeSeconds: number;
}[]): ListedMarket[] {
  return rows
    .filter((row) => row.listed)
    .map((row) => ({
      id: row.id,
      display: row.displayName,
      floor: floorLabel(row.minimumPrice),
      ready: !row.paused,
      note: row.paused ? "paused" : null,
      feedAggregator: row.feedAggregator,
      minimumPrice: row.minimumPrice.toString(),
      sourceChainKey: Number(row.sourceChainKey),
      maxAgeSeconds: Number(row.maxAgeSeconds),
    }));
}

export async function readMarkets(): Promise<MarketsPayload> {
  if (!protocolDeployed() || !PROTOCOL.registry) {
    return {
      source: "seed",
      markets: seedMarkets(),
      protocolDeployed: false,
    };
  }
  try {
    const registry = new Contract(PROTOCOL.registry, REGISTRY_ABI, provider());
    const rows = await registry.listedMarkets();
    return {
      source: "registry",
      markets: mapRows(rows),
      protocolDeployed: true,
    };
  } catch {
    return {
      source: "seed",
      markets: seedMarkets(),
      protocolDeployed: false,
      error: "Could not read registry. Showing seed list.",
    };
  }
}

export async function readWindow(): Promise<WindowPayload> {
  if (!protocolDeployed() || !PROTOCOL.engine) {
    return { live: false, protocolDeployed: false, window: null };
  }
  try {
    const rpc = provider();
    const engine = new Contract(PROTOCOL.engine, ENGINE_ABI, rpc);
    const inWindow = Boolean(await engine.inWindow());
    const window = await engine.liveWindow();
    if (Number(window.verifiedAt) === 0) {
      return { live: false, protocolDeployed: true, window: null };
    }
    let market = "listed market";
    if (PROTOCOL.registry) {
      const registry = new Contract(PROTOCOL.registry, REGISTRY_ABI, rpc);
      const row = await registry.getMarket(window.marketId).catch(() => null);
      if (row?.displayName) market = row.displayName;
    }
    return {
      live: inWindow,
      protocolDeployed: true,
      window: {
        market,
        txKey: window.txKey,
        observedHuman: formatUsd8(window.answer),
        until: Number(window.validUntil) * 1000,
        openedAt: Number(window.verifiedAt) * 1000,
        emitter: window.emitter,
      },
    };
  } catch {
    return { live: false, protocolDeployed: true, window: null, error: true };
  }
}
