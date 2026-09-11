import { Contract, JsonRpcProvider } from "ethers";
import { ENGINE_ABI, REGISTRY_ABI } from "./abi";
import { ETHEREUM, SETTLEMENT } from "./constants";
import { PROTOCOL, protocolDeployed } from "./deployments";
import { floorLabel, formatUsd8 } from "./markets";
import type { ListedMarket } from "./types";

const FEED_ABI = [
  "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
];

export type ChainWindow = {
  market: string;
  txKey: string;
  observedHuman: string;
  until: number;
  openedAt: number;
  emitter: string;
};

export type MarketsPayload = {
  source: "registry" | "none";
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

function settlementProvider() {
  return new JsonRpcProvider(SETTLEMENT.rpc, SETTLEMENT.chainId, {
    staticNetwork: true,
  });
}

async function ethereumProvider(): Promise<JsonRpcProvider | null> {
  const extra = process.env.ETH_RPC;
  const urls = extra ? [extra, ...ETHEREUM.rpcs] : [...ETHEREUM.rpcs];
  for (const url of urls) {
    try {
      const provider = new JsonRpcProvider(url, 1, { staticNetwork: true });
      await provider.getBlockNumber();
      return provider;
    } catch {
      continue;
    }
  }
  return null;
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
      liveRpcHuman: null,
      liveRpcUpdatedAt: null,
    }));
}

async function attachLiveRpc(markets: ListedMarket[]): Promise<ListedMarket[]> {
  const eth = await ethereumProvider();
  if (!eth) return markets;
  return Promise.all(
    markets.map(async (market) => {
      if (!market.feedAggregator) return market;
      try {
        const feed = new Contract(market.feedAggregator, FEED_ABI, eth);
        const round = await feed.latestRoundData();
        const answer = round.answer as bigint;
        const updatedAt = Number(round.updatedAt);
        return {
          ...market,
          liveRpcHuman: formatUsd8(answer),
          liveRpcUpdatedAt: updatedAt,
        };
      } catch {
        return market;
      }
    }),
  );
}

export async function readMarkets(): Promise<MarketsPayload> {
  if (!protocolDeployed() || !PROTOCOL.registry) {
    return {
      source: "none",
      markets: [],
      protocolDeployed: false,
      error: "Registry is not deployed. No JSON catalog.",
    };
  }
  try {
    const registry = new Contract(PROTOCOL.registry, REGISTRY_ABI, settlementProvider());
    const rows = await registry.listedMarkets();
    const markets = await attachLiveRpc(mapRows(rows));
    return {
      source: "registry",
      markets,
      protocolDeployed: true,
    };
  } catch {
    return {
      source: "none",
      markets: [],
      protocolDeployed: true,
      error: "Could not read VinceRegistry. Fail closed — no seed list.",
    };
  }
}

export async function readWindow(): Promise<WindowPayload> {
  if (!protocolDeployed() || !PROTOCOL.engine) {
    return { live: false, protocolDeployed: false, window: null };
  }
  try {
    const rpc = settlementProvider();
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
