export type HashKind = "empty" | "invalid" | "wallet" | "tx";

export function classifyHash(raw: string): HashKind {
  const value = raw.trim();
  if (!value) return "empty";
  if (/^0x[0-9a-fA-F]{64}$/.test(value)) return "tx";
  if (/^0x[0-9a-fA-F]{40}$/.test(value)) return "wallet";
  return "invalid";
}

export function shortenHash(hash: string, size = 6): string {
  if (hash.length < 12) return hash;
  return `${hash.slice(0, 2 + size)}…${hash.slice(-size)}`;
}
