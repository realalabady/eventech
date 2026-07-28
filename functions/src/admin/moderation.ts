import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import { requireAdmin, writeAuditLog } from "../lib/admin-guards";
import type { CallableResponse } from "../lib/errors";

const MAX_REASON = 280;

/**
 * Statuses an admin may move an event to.
 *
 * Deliberately not the full `EventStatus` list: moderation is about taking
 * something down, and letting an admin flip an event to `live` or `completed`
 * would let them drive an organizer's lifecycle from the outside. `published`
 * is included only so a takedown can be reversed.
 */
const MODERATION_STATUSES = ["published", "cancelled", "archived"] as const;
type ModerationStatus = (typeof MODERATION_STATUSES)[number];

/**
 * Grants or removes the verified badge (canonical §6's `verifyOrganizer`).
 *
 * Verification is **badge-only** — canonical §3 is explicit that unverified
 * organizers can still publish and accept bookings. It buys trust and discovery
 * placement, nothing more, so this never touches the organization's ability to
 * operate.
 */
export const verifyOrganizer = onCall<
  { organizationId?: string; verified?: boolean },
  Promise<CallableResponse>
>(async (request) => {
  const { uid } = requireAdmin(request);
  const { organizationId, verified } = request.data ?? {};

  if (!organizationId || typeof verified !== "boolean") {
    throw new HttpsError("invalid-argument", "Missing verification fields.", {
      code: "VALIDATION_ERROR",
    });
  }

  const ref = getFirestore().collection("organizations").doc(organizationId);
  if (!(await ref.get()).exists) {
    throw new HttpsError("not-found", "Organization not found.", {
      code: "NOT_FOUND",
    });
  }

  await ref.update({ verified, updatedAt: FieldValue.serverTimestamp() });
  await writeAuditLog({
    actorId: uid,
    action: "verifyOrganizer",
    resourceType: "organization",
    resourceId: organizationId,
    metadata: { verified },
  });

  return { success: true, message: "Verification updated." };
});

/**
 * Suspends an organization (canonical §6's `suspendOrganization`).
 *
 * The flag alone would be decoration, so `publishEvent` refuses while it is
 * set — a suspended organization cannot put anything new in front of the
 * public. Already-published events are left alone deliberately: pulling them
 * would strand attendees holding valid tickets, so taking an event down is a
 * separate, per-event decision through `updateEventStatus`.
 */
export const suspendOrganization = onCall<
  { organizationId?: string; suspended?: boolean; reason?: string },
  Promise<CallableResponse>
>(async (request) => {
  const { uid } = requireAdmin(request);
  const { organizationId, suspended, reason } = request.data ?? {};

  if (!organizationId || typeof suspended !== "boolean") {
    throw new HttpsError("invalid-argument", "Missing suspension fields.", {
      code: "VALIDATION_ERROR",
    });
  }

  const ref = getFirestore().collection("organizations").doc(organizationId);
  if (!(await ref.get()).exists) {
    throw new HttpsError("not-found", "Organization not found.", {
      code: "NOT_FOUND",
    });
  }

  const cleanReason = suspended
    ? reason?.trim().slice(0, MAX_REASON) || null
    : null;

  await ref.update({
    suspended,
    suspendedReason: cleanReason,
    updatedAt: FieldValue.serverTimestamp(),
  });
  await writeAuditLog({
    actorId: uid,
    action: "suspendOrganization",
    resourceType: "organization",
    resourceId: organizationId,
    metadata: { suspended, reason: cleanReason },
  });

  return { success: true, message: "Organization updated." };
});

/**
 * Admin event moderation (canonical §6's `updateEventStatus`).
 *
 * Moving an event off `published` is what actually removes it from the public
 * site: discovery and the event pages all query `status == "published"`, so a
 * takedown is a status change rather than a delete — the record, its bookings
 * and its tickets all survive for the people already holding them.
 */
export const updateEventStatus = onCall<
  { eventId?: string; status?: string; reason?: string },
  Promise<CallableResponse>
>(async (request) => {
  const { uid } = requireAdmin(request);
  const { eventId, status, reason } = request.data ?? {};

  if (!eventId || !MODERATION_STATUSES.includes(status as ModerationStatus)) {
    throw new HttpsError("invalid-argument", "Invalid event or status.", {
      code: "VALIDATION_ERROR",
    });
  }

  const ref = getFirestore().collection("events").doc(eventId);
  const event = (await ref.get()).data();
  if (!event) {
    throw new HttpsError("not-found", "Event not found.", {
      code: "NOT_FOUND",
    });
  }

  // Restoring an event that was never published would put a draft in front of
  // the public without its owner ever pressing publish.
  if (status === "published" && !event.publishedAt) {
    throw new HttpsError("failed-precondition", "Event was never published.", {
      code: "VALIDATION_ERROR",
    });
  }

  const cleanReason = reason?.trim().slice(0, MAX_REASON) || null;

  await ref.update({
    status,
    moderationReason: cleanReason,
    updatedAt: FieldValue.serverTimestamp(),
  });
  await writeAuditLog({
    actorId: uid,
    action: "updateEventStatus",
    resourceType: "event",
    resourceId: eventId,
    metadata: { status, reason: cleanReason },
  });

  return { success: true, message: "Event status updated." };
});
