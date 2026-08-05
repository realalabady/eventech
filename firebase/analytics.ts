"use client";

import type { FirebaseApp } from "firebase/app";
import {
  getAnalytics,
  isSupported,
  logEvent,
  setAnalyticsCollectionEnabled,
  type Analytics,
} from "firebase/analytics";
import { getPerformance } from "firebase/performance";

import { getConsent } from "@/lib/analytics/consent";
import type { AnalyticsEventName, AnalyticsParams } from "@/lib/analytics/events";

/**
 * Firebase Analytics + Performance Monitoring.
 *
 * Both ship inside the `firebase` package already in use, so this adds no
 * dependency. Guide 49 recommends Sentry for error tracking; that is recorded
 * in docs/LAUNCH_CHECKLIST.md §4 as a decision (extra dependency plus a DSN),
 * not a task, and is deliberately not bundled here.
 *
 * Everything is lazy and best-effort. Analytics failing must never take a page
 * down, so every entry point swallows its errors — a missing measurement ID or
 * a blocking extension is a normal condition, not an exception.
 */

let analytics: Analytics | null = null;
let initStarted = false;

/**
 * `isSupported()` is required, not optional: Analytics throws during
 * construction in environments without IndexedDB or cookies, which includes
 * some in-app browsers and every SSR pass.
 */
export async function initAnalyticsOnce(app: FirebaseApp): Promise<void> {
  if (initStarted || typeof window === "undefined") return;
  initStarted = true;

  // No measurement ID means Analytics was never provisioned for this project.
  if (!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) return;

  try {
    if (await isSupported()) {
      analytics = getAnalytics(app);
      // Applies the stored opt-out before any event can be queued.
      setAnalyticsCollectionEnabled(analytics, getConsent() === "granted");
    }
  } catch {
    analytics = null;
  }

  try {
    // Constructing it is the whole integration: Performance Monitoring
    // auto-instruments page load, navigation and every fetch/XHR from that
    // point on. The handle is intentionally discarded — nothing calls it, and
    // custom traces are not needed for TASK_12's network metrics.
    getPerformance(app);
  } catch {
    // Blocked or unsupported. Page performance must not depend on measuring it.
  }
}

/** Applies a consent change immediately, without a reload. */
export function applyAnalyticsConsent(granted: boolean): void {
  if (!analytics) return;
  try {
    setAnalyticsCollectionEnabled(analytics, granted);
  } catch {
    // Best effort; the stored preference is still authoritative on next load.
  }
}

/**
 * Records a product event.
 *
 * Params must be primitives, and must never include an email, display name,
 * IBAN, QR token or raw document body. Pass an id or a count instead. The type
 * narrows the shape; this comment is the rule the type cannot express.
 */
export function track(
  name: AnalyticsEventName,
  params?: AnalyticsParams,
): void {
  if (!analytics || getConsent() !== "granted") return;
  try {
    // Cast to the custom-event overload. Firebase types GA4's reserved names
    // (`sign_up`, `login`, `search`, ...) with required parameter shapes; our
    // taxonomy deliberately sends fewer fields than those signatures demand,
    // and the reserved names are what GA4 builds its own reports from, so
    // renaming them to dodge the types would lose that.
    logEvent(analytics, name as string, params);
  } catch {
    // Ad blockers reject the transport. Losing an event is acceptable;
    // throwing inside a click handler is not.
  }
}
