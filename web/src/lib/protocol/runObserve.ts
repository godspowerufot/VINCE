import type { ObserveEvent, ObserveResult } from "./types";

export async function runObserve(
  tx: string,
  onEvent: (event: ObserveEvent) => void,
  signal?: AbortSignal,
): Promise<ObserveResult | { error: string }> {
  const response = await fetch("/api/observe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tx }),
    signal,
  });
  if (!response.ok || !response.body) {
    return { error: "Verification unavailable. Fail closed." };
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: ObserveResult | null = null;
  let error: string | null = null;
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line) as ObserveEvent;
      onEvent(event);
      if (event.type === "result") result = event.result;
      if (event.type === "error") error = event.error;
    }
    if (done) break;
  }
  if (error) return { error };
  if (!result) return { error: "Verification unavailable. Fail closed." };
  return result;
}
