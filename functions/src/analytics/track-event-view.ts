import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import type { CallableResponse } from "../lib/errors";

/**
 * Records a view of a published event page (canonical §6's `trackEventView`).
 *
 * Deliberately unauthenticated — the public event page is the whole point, and
 * most viewers are not signed in. The counter lives on the event document
 * because `events` is `allow write: if false`; only this callable can move it.
 *
 * The read before the increment is not ceremony: without it any id at all would
 * mint a stray `stats` map on a document that may not exist, and drafts would
 * accrue views they can never have had.
 *
 * Not rate limited. Anyone can inflate a view count by calling this in a loop.
 * That is deliberate for now — canonical §7 defers rate limiting to Phase 11 —
 * and it is why views feed a vanity metric and never anything financial.
 */
export const trackEventView = onCall<
  { eventId?: string },
  Promise<CallableResponse>
>(async (request) => {
  const eventId = request.data?.eventId;
  if (!eventId) {
    throw new HttpsError("invalid-argument", "eventId required.", {
      code: "VALIDATION_ERROR",
    });
  }

  const ref = getFirestore().collection("events").doc(eventId);
  const event = (await ref.get()).data();
  if (!event || event.status !== "published") {
    throw new HttpsError("not-found", "Event not found.", {
      code: "NOT_FOUND",
    });
  }

  await ref.update({ "stats.views": FieldValue.increment(1) });
  return { success: true, message: "View recorded." };
});
