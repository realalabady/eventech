/**
 * Analytics consent.
 *
 * TASK_12 requires GDPR-ready practices and an opt-out. This is opt-OUT rather
 * than opt-in: Firebase Analytics is first-party, collects no advertising
 * identifiers here, and every event we send is a product action rather than a
 * personal attribute. A consent banner would be required if that changed —
 * see `trackEvent` for the rule that keeps it true.
 *
 * The choice is stored in localStorage under a versioned key. Bumping the
 * version invalidates prior choices, which is what you want if the scope of
 * collection ever widens.
 */

const STORAGE_KEY = "evntech-analytics-consent-v1";

export type ConsentState = "granted" | "denied";

/**
 * Defaults to granted. Reading is guarded because this runs during render on
 * the client and must not throw in SSR or in a browser with storage disabled
 * (Safari private mode throws on access, not just on write).
 */
export function getConsent(): ConsentState {
  if (typeof window === "undefined") return "denied";
  try {
    return localStorage.getItem(STORAGE_KEY) === "denied" ? "denied" : "granted";
  } catch {
    // Storage unavailable — treat as denied rather than assume permission.
    return "denied";
  }
}

export function setConsent(state: ConsentState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, state);
  } catch {
    // Nothing to do: without storage the choice cannot persist, and the
    // read path already fails closed.
  }
}
