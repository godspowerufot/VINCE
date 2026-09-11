import seed from "./seed.json";
import type { ListedMarket } from "./types";

export function formatUsd8(value: bigint): string {
  const neg = value < BigInt(0);
  const abs = neg ? -value : value;
  const scale = BigInt(100_000_000);
  const whole = abs / scale;
  const frac = abs % scale;
  const fracStr = frac.toString().padStart(8, "0").replace(/0+$/, "") || "0";
  return `${neg ? "-" : ""}$${whole.toString()}.${fracStr}`;
}

export function floorLabel(minimumPrice: bigint): string {
  return `≥ ${formatUsd8(minimumPrice)}`;
}

export function seedMarkets(): ListedMarket[] {
  const listed = seed.markets.map((m) => ({
    id: m.id,
    display: m.displayName,
    floor: floorLabel(BigInt(m.minimumPrice)),
    ready: true,
    note: null as string | null,
    feedAggregator: m.feedAggregator,
    minimumPrice: m.minimumPrice,
    sourceChainKey: m.sourceChainKey,
    maxAgeSeconds: m.maxAgeSeconds,
  }));
  return [
    ...listed,
    {
      id: "eth-tsla-usd",
      display: "TSLA/USD",
      floor: "≥ $250",
      ready: false,
      note: "aggregator still being sourced",
    },
  ];
}

export function matchSeed(emitter: string) {
  const key = emitter.toLowerCase();
  return seed.markets.find((m) => m.feedAggregator.toLowerCase() === key) ?? null;
}
