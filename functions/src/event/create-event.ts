import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import type { CallableResponse } from "../lib/errors";
import { requireAuth, requireMemberRole } from "../lib/organization-guards";

type Payload = { organizationId?: string; title?: string };

/**
 * Default production timeline seeded with every event (guide 39): the organizer
 * lands in a workspace that already knows the shape of the job rather than an
 * empty board.
 */
const TIMELINE_MILESTONES = [
  "planning",
  "venue",
  "artists",
  "production",
  "marketing",
  "published",
] as const;

const DEFAULT_TASKS = [
  "confirmVenue",
  "confirmLineup",
  "openBookings",
  "briefDoorStaff",
] as const;

/**
 * Creates a draft event plus its timeline and starter tasks in one batch.
 * The event is born `draft` with bookings closed; nothing is public until
 * publishEvent runs its gates.
 */
export const createEvent = onCall<
  Payload,
  Promise<CallableResponse<{ eventId: string }>>
>(async (request) => {
  const { uid } = requireAuth(request);
  const organizationId = request.data?.organizationId;
  if (!organizationId) {
    throw new HttpsError("invalid-argument", "organizationId required.", {
      code: "VALIDATION_ERROR",
    });
  }
  await requireMemberRole(organizationId, uid, ["owner", "manager"]);

  const title = (request.data?.title ?? "").trim().slice(0, 120);
  const db = getFirestore();
  const eventRef = db.collection("events").doc();
  const now = FieldValue.serverTimestamp();

  const batch = db.batch();
  batch.set(eventRef, {
    id: eventRef.id,
    organizationId,
    slug: null, // assigned at publish, so drafts never squat public URLs
    title: title || null,
    description: null,
    category: null,
    status: "draft",
    coverImage: null,
    venueId: null,
    artistIds: [],
    ticketTypes: [],
    capacity: 0,
    soldTickets: 0,
    availableTickets: 0,
    startDate: null,
    endDate: null,
    bookingOpen: false,
    featured: false,
    branding: { primary: "#3b82f6" },
    createdBy: uid,
    createdAt: now,
    updatedAt: now,
  });

  TIMELINE_MILESTONES.forEach((stage, order) => {
    batch.set(db.collection("timeline").doc(), {
      eventId: eventRef.id,
      organizationId,
      stage,
      order,
      completed: false,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  });

  DEFAULT_TASKS.forEach((titleKey) => {
    batch.set(db.collection("tasks").doc(), {
      eventId: eventRef.id,
      organizationId,
      titleKey,
      status: "todo",
      priority: "medium",
      assigneeId: null,
      dueDate: null,
      createdBy: uid,
      createdAt: now,
      updatedAt: now,
    });
  });

  batch.set(db.collection("activityLogs").doc(), {
    organizationId,
    eventId: eventRef.id,
    actorId: uid,
    action: "createEvent",
    resourceType: "event",
    resourceId: eventRef.id,
    createdAt: now,
  });

  await batch.commit();

  return {
    success: true,
    message: "Event created.",
    data: { eventId: eventRef.id },
  };
});
