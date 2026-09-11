"use client";

import { useSyncExternalStore } from "react";
import { formatRemain, type LiveWindow } from "@/lib/windowStore";

let cachedNow = 0;

function subscribeNow(onStoreChange: () => void) {
  cachedNow = Date.now();
  const id = window.setInterval(() => {
    cachedNow = Date.now();
    onStoreChange();
  }, 1000);
  return () => window.clearInterval(id);
}

function nowMs() {
  if (cachedNow === 0) cachedNow = Date.now();
  return cachedNow;
}

function nowServer() {
  return 0;
}

export function WindowClock({ live }: { live: LiveWindow }) {
  const now = useSyncExternalStore(subscribeNow, nowMs, nowServer);
  const remain = formatRemain(live.until, now);
  const expired = now !== 0 && live.until <= now;

  return (
    <p className="text-[15px]">
      <span className="text-mute">Window</span>
      <span className="ml-3 tabular-nums text-ink">
        {expired ? "expired" : `${remain} remaining`}
      </span>
    </p>
  );
}
