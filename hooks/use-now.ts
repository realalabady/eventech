"use client";

import { useSyncExternalStore } from "react";

/** Quantised to the minute so the snapshot is stable between reads. */
const TICK_MS = 60_000;

function quantised(): number {
  return Math.floor(Date.now() / TICK_MS) * TICK_MS;
}

function subscribe(onChange: () => void): () => void {
  const timer = setInterval(onChange, TICK_MS);
  return () => clearInterval(timer);
}

/**
 * The current time, to the minute, as an external store.
 *
 * The clock genuinely is an external mutable source, so reading it during
 * render is impure and reading it on the server would produce a snapshot the
 * client disagrees with. This returns `null` until mounted, which callers
 * should treat as "not decided yet" rather than as an instant in 1970.
 */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, quantised, () => null);
}
