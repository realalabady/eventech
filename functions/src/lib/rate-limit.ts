import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";

/**
 * Rate limiting (canonical §194: built compatible from day 1, ENFORCED at
 * Phase 11). `RATE_LIMITED` has been in `ERROR_CODES` since the start for this.
 *
 * Fixed window rather than a sliding one. A sliding window needs either a
 * sorted set of timestamps per caller or a second store; a fixed window is one
 * document and one transaction, and its worst case — 2x the limit across a
 * window boundary — is irrelevant at these volumes. The point is to stop a
 * loop, not to meter billing.
 *
 * State lives in `rateLimits`, which `firestore.rules` denies to every client:
 * only these callables touch it.
 */

export type RateLimit = { limit: number; windowMs: number };

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/**
 * Guide 22 §Rate Limits, mapped onto the callables that implement each one.
 *
 * Guide 22's "Authentication" limit is Firebase Auth's own concern and it
 * already throttles sign-in server-side; "Search" is served by static discovery
 * pages with no callable behind it; "Notifications" has no callable yet. Those
 * three are therefore absent rather than forgotten.
 */
export const RATE_LIMITS = {
  /** Guide 22: Bookings, 5/minute. */
  createBooking: { limit: 5, windowMs: MINUTE },
  /** Guide 22: Receipt Upload, 10/hour. */
  submitReceipt: { limit: 10, windowMs: HOUR },
  /** Guide 22: Invitations, 20/hour. */
  inviteMember: { limit: 20, windowMs: HOUR },
  /**
   * Not in guide 22. It is the only non-admin callable in the admin surface,
   * and until now the single thing stopping someone burying the moderation
   * queue was "one open report per person per target" — which still allows a
   * fresh report against every event on the platform. Reporting is a rare,
   * deliberate act, so the ceiling is deliberately low.
   */
  submitReport: { limit: 5, windowMs: HOUR },
  /**
   * Unauthenticated and keyed by IP. `trackEventView` moves a counter the
   * organizer's analytics reads, so an unbounded loop is both a fabricated
   * metric and a write-cost problem. Generous enough that a real person
   * browsing events never notices.
   */
  trackEventView: { limit: 60, windowMs: MINUTE },
} as const satisfies Record<string, RateLimit>;

export type RateLimitedAction = keyof typeof RATE_LIMITS;

/**
 * Who the limit applies to. Signed-in callers are metered per account; the
 * unauthenticated ones fall back to the caller's IP, which is the only
 * identity available and is why those limits are set loosely enough to
 * survive a shared NAT.
 */
export function rateLimitKey(request: CallableRequest): string {
  if (request.auth?.uid) return `uid_${request.auth.uid}`;
  const ip = request.rawRequest?.ip;
  return ip ? `ip_${ip.replace(/[^a-zA-Z0-9]/g, "-")}` : "anonymous";
}

/**
 * Counts this call against `action`'s budget and throws once it is spent.
 *
 * Call it *after* validating the request but *before* doing the work, so a
 * malformed payload does not consume someone's allowance — and so the
 * expensive part never runs for a caller who is already over.
 */
export async function enforceRateLimit(
  action: RateLimitedAction,
  request: CallableRequest,
): Promise<void> {
  const { limit, windowMs } = RATE_LIMITS[action];
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const key = rateLimitKey(request);

  const db = getFirestore();
  const ref = db
    .collection("rateLimits")
    .doc(`${action}__${key}__${windowStart}`);

  const allowed = await db.runTransaction(async (tx) => {
    const count = (await tx.get(ref)).data()?.count ?? 0;
    if (count >= limit) return false;
    tx.set(ref, {
      action,
      key,
      count: count + 1,
      // Read by the Firestore TTL policy on `rateLimits.expiresAt`, which is
      // what stops this collection growing without bound. See
      // docs/LAUNCH_CHECKLIST.md — without that policy nothing ever deletes
      // these documents.
      expiresAt: Timestamp.fromMillis(windowStart + windowMs * 2),
    });
    return true;
  });

  if (!allowed) {
    const retryAfter = Math.ceil((windowStart + windowMs - now) / 1000);
    throw new HttpsError(
      "resource-exhausted",
      `Too many requests. Try again in ${retryAfter}s.`,
      { code: "RATE_LIMITED", retryAfter },
    );
  }
}
