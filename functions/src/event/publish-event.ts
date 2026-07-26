import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import type { CallableResponse } from "../lib/errors";
import {
  buildUniqueSlug,
  requireAuth,
  requireMemberRole,
} from "../lib/organization-guards";

type Payload = { eventId?: string };

/**
 * Takes an event live. Every gate below is enforced here rather than in the UI,
 * because publishing is what makes an event bookable by the public.
 *
 * Gates (guide 50 §8, guide 38):
 *  1. Caller is an owner or manager of the owning organization.
 *  2. Caller's email is verified — publishing is a gated action.
 *  3. The event is complete: title, category, venue, dates, ticket types.
 *  4. A PAID event requires the organization's bank details, since attendees
 *     transfer to that IBAN and upload a receipt. Free events are exempt.
 */
export const publishEvent = onCall<
  Payload,
  Promise<CallableResponse<{ slug: string }>>
>(async (request) => {
  const { uid } = requireAuth(request);
  const eventId = request.data?.eventId;
  if (!eventId) {
    throw new HttpsError("invalid-argument", "eventId required.", {
      code: "VALIDATION_ERROR",
    });
  }

  if (request.auth?.token.email_verified !== true) {
    throw new HttpsError(
      "failed-precondition",
      "Confirm your email before publishing.",
      { code: "EMAIL_NOT_VERIFIED" },
    );
  }

  const db = getFirestore();
  const eventRef = db.collection("events").doc(eventId);
  const snapshot = await eventRef.get();
  const event = snapshot.data();
  if (!snapshot.exists || !event) {
    throw new HttpsError("not-found", "Event not found.", {
      code: "NOT_FOUND",
    });
  }
  await requireMemberRole(event.organizationId, uid, ["owner", "manager"]);

  if (event.status !== "draft" && event.status !== "planning") {
    throw new HttpsError("failed-precondition", "Event is not a draft.", {
      code: "VALIDATION_ERROR",
    });
  }

  const ticketTypes: Array<{ price: number; quantity: number }> =
    event.ticketTypes ?? [];
  const missing: string[] = [];
  if (!event.title) missing.push("title");
  if (!event.category) missing.push("category");
  if (!event.venueId) missing.push("venue");
  if (!event.startDate) missing.push("startDate");
  if (!event.endDate) missing.push("endDate");
  if (ticketTypes.length === 0) missing.push("ticketTypes");

  if (missing.length > 0) {
    throw new HttpsError("failed-precondition", "Event is incomplete.", {
      code: "EVENT_INCOMPLETE",
      missing,
    });
  }

  const isPaid = ticketTypes.some((type) => type.price > 0);
  if (isPaid) {
    const org = (
      await db.collection("organizations").doc(event.organizationId).get()
    ).data();
    if (!org?.payment?.iban) {
      throw new HttpsError(
        "failed-precondition",
        "Add your bank details before publishing a paid event.",
        { code: "PAYMENT_DETAILS_REQUIRED" },
      );
    }
  }

  // Drafts hold no slug, so a public URL is only minted once, at publish.
  const slug = event.slug ?? (await buildUniqueSlug(event.title, "events"));
  const now = FieldValue.serverTimestamp();

  const batch = db.batch();
  batch.update(eventRef, {
    slug,
    status: "published",
    bookingOpen: true,
    publishedAt: now,
    updatedAt: now,
  });

  batch.set(db.collection("activityLogs").doc(), {
    organizationId: event.organizationId,
    eventId,
    actorId: uid,
    action: "publishEvent",
    resourceType: "event",
    resourceId: eventId,
    metadata: { slug, paid: isPaid },
    createdAt: now,
  });

  await batch.commit();

  // Mark the "published" milestone complete; failure here must not undo the
  // publish itself, so it runs after the batch rather than inside it.
  const milestone = await db
    .collection("timeline")
    .where("eventId", "==", eventId)
    .where("stage", "==", "published")
    .limit(1)
    .get();
  if (!milestone.empty) {
    await milestone.docs[0].ref.update({
      completed: true,
      completedAt: now,
      updatedAt: now,
    });
  }

  return { success: true, message: "Event published.", data: { slug } };
});
