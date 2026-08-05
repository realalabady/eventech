"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { getFirebaseFirestore } from "@/firebase/client";

/**
 * Reads one feature flag.
 *
 * `setFeatureFlag` (admin callable) writes these; `featureFlags` is
 * world-readable by design — a flag name and a boolean are not secrets, and the
 * marketing pages gate on them for signed-out visitors.
 *
 * Defaults to `false` and stays false until the document confirms otherwise,
 * including on permission or network error. A flag that fails open would ship
 * an unfinished feature the moment Firestore hiccups, which is the opposite of
 * what a kill switch is for.
 *
 * TASK_13 names the intended flags: payments, subscriptions, messaging, AI,
 * beta. Nothing is hardcoded here — the flag id is the document id.
 */
export function useFeatureFlag(flagId: string | undefined): {
  enabled: boolean;
  loading: boolean;
} {
  const [state, setState] = useState<{
    key: string | null;
    enabled: boolean;
    loading: boolean;
  }>({ key: null, enabled: false, loading: true });

  useEffect(() => {
    if (!flagId) return;

    return onSnapshot(
      doc(getFirebaseFirestore(), "featureFlags", flagId),
      (document) =>
        setState({
          key: flagId,
          enabled: document.exists() && document.data().enabled === true,
          loading: false,
        }),
      () => setState({ key: flagId, enabled: false, loading: false }),
    );
  }, [flagId]);

  if (state.key !== flagId) {
    return { enabled: false, loading: Boolean(flagId) };
  }
  return { enabled: state.enabled, loading: state.loading };
}
