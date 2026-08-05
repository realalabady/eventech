"use client";

import { WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useSyncExternalStore } from "react";

/**
 * Offline indicator.
 *
 * Firestore queues writes and replays them on reconnect, so going offline is
 * recoverable rather than fatal — but silently. Without this the app looks
 * merely slow, and a user retries a booking that was already queued.
 *
 * `useSyncExternalStore` rather than state-in-an-effect: `navigator.onLine` is
 * external to React and unavailable during SSR, and this hook takes a separate
 * server snapshot for exactly that case.
 *
 * `navigator.onLine` only proves a link exists, not that the internet is
 * reachable — false negatives are impossible but false positives are not.
 * Treated as a hint, which is why the copy says changes will sync rather than
 * claiming anything has failed.
 */
function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

export function OfflineBanner() {
  const t = useTranslations("common");

  const online = useSyncExternalStore(
    subscribe,
    useCallback(() => navigator.onLine, []),
    // Server render assumes online: a banner in the SSR markup would flash for
    // every visitor before hydration corrects it.
    useCallback(() => true, []),
  );

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-2 bg-warning px-4 py-2 text-caption text-background"
    >
      <WifiOff aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="font-medium">{t("offline")}</span>
      <span className="opacity-80">{t("offlineHint")}</span>
    </div>
  );
}
