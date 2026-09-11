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

export function matchListed(
  markets: ListedMarket[],
  emitter: string,
): ListedMarket | null {
  const key = emitter.toLowerCase();
  return (
    markets.find(
      (row) => row.ready && row.feedAggregator?.toLowerCase() === key,
    ) ?? null
  );
}
