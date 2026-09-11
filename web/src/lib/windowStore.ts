const KEY = "vince.preview.window";

export type LiveWindow = {
  market: string;
  tx: string;
  observedHuman: string;
  openedAt: number;
  until: number;
};

export const WINDOW_MS = 30 * 60 * 1000;

let snapshot: LiveWindow | null = null;
let snapshotRaw: string | null = null;
let snapshotReady = false;

function loadSnapshot(): LiveWindow | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (snapshotReady && raw === snapshotRaw) {
    if (snapshot && snapshot.until <= Date.now()) {
      sessionStorage.removeItem(KEY);
      snapshot = null;
      snapshotRaw = null;
    }
    return snapshot;
  }
  snapshotReady = true;
  snapshotRaw = raw;
  if (!raw) {
    snapshot = null;
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as LiveWindow;
    if (parsed.until <= Date.now()) {
      sessionStorage.removeItem(KEY);
      snapshot = null;
      snapshotRaw = null;
      return null;
    }
    snapshot = parsed;
    return snapshot;
  } catch {
    snapshot = null;
    return null;
  }
}

export function readWindow(): LiveWindow | null {
  return loadSnapshot();
}

export function getServerWindow(): LiveWindow | null {
  return null;
}

export function writeWindow(next: Omit<LiveWindow, "openedAt" | "until">) {
  const openedAt = Date.now();
  const payload: LiveWindow = {
    ...next,
    openedAt,
    until: openedAt + WINDOW_MS,
  };
  const raw = JSON.stringify(payload);
  sessionStorage.setItem(KEY, raw);
  snapshot = payload;
  snapshotRaw = raw;
  snapshotReady = true;
  window.dispatchEvent(new Event("vince-window"));
  return payload;
}

export function clearWindow() {
  sessionStorage.removeItem(KEY);
  snapshot = null;
  snapshotRaw = null;
  snapshotReady = true;
  window.dispatchEvent(new Event("vince-window"));
}

export function subscribeWindow(onStoreChange: () => void) {
  window.addEventListener("vince-window", onStoreChange);
  return () => window.removeEventListener("vince-window", onStoreChange);
}

export function formatRemain(until: number, now = Date.now()) {
  const ms = Math.max(0, until - now);
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
