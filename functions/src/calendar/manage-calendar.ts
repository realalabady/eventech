import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import type { CallableResponse } from "../lib/errors";
import { requireAuth, requireMemberRole } from "../lib/organization-guards";

const KINDS = ["meeting", "deadline", "setup", "other"] as const;

/** Same rule as the task board: scanners only work the door. */
const CALENDAR_ROLES = ["owner", "manager", "staff"] as const;

const MAX_TITLE = 140;
const MAX_LOCATION = 140;

type Kind = (typeof KINDS)[number];

/**
 * Loads an entry and confirms the caller may act on it. The entry's own
 * `organizationId` is the authority, never one supplied by the client
 * (canonical §7).
 */
async function requireEntryAccess(entryId: string, uid: string) {
  const ref = getFirestore().collection("calendarEvents").doc(entryId);
  const data = (await ref.get()).data();
  if (!data) {
    throw new HttpsError("not-found", "Calendar entry not found.", {
      code: "NOT_FOUND",
    });
  }
  await requireMemberRole(data.organizationId, uid, [...CALENDAR_ROLES]);
  return { ref, data };
}

/**
 * An entry may hang off an event, but does not have to — a production meeting
 * or a load-in date can belong to the organization alone. When an event is
 * named it must belong to the same organization, or a member of org A could
 * pin an entry to org B's event.
 */
async function assertEventInOrg(
  eventId: string | null,
  organizationId: string,
) {
  if (!eventId) return;
  const event = (
    await getFirestore().collection("events").doc(eventId).get()
  ).data();
  if (!event || event.organizationId !== organizationId) {
    throw new HttpsError("not-found", "Event not found.", {
      code: "NOT_FOUND",
    });
  }
}

export const createCalendarEvent = onCall<
  {
    organizationId?: string;
    eventId?: string | null;
    title?: string;
    kind?: string;
    startAt?: number;
    endAt?: number | null;
    allDay?: boolean;
    location?: string | null;
  },
  Promise<CallableResponse<{ entryId: string }>>
>(async (request) => {
  const { uid } = requireAuth(request);
  const { organizationId, title, startAt } = request.data ?? {};

  if (!organizationId || !title?.trim() || !Number.isFinite(startAt)) {
    throw new HttpsError("invalid-argument", "Missing calendar fields.", {
      code: "VALIDATION_ERROR",
    });
  }
  await requireMemberRole(organizationId, uid, [...CALENDAR_ROLES]);

  const eventId = request.data?.eventId || null;
  await assertEventInOrg(eventId, organizationId);

  const start = toDate(startAt);
  const end = toDate(request.data?.endAt);
  assertOrdered(start, end);

  const now = FieldValue.serverTimestamp();
  const ref = getFirestore().collection("calendarEvents").doc();
  await ref.set({
    organizationId,
    eventId,
    title: title.trim().slice(0, MAX_TITLE),
    kind: coerce(request.data?.kind, KINDS, "meeting"),
    startAt: start,
    endAt: end,
    allDay: request.data?.allDay === true,
    location: trimOrNull(request.data?.location, MAX_LOCATION),
    createdBy: uid,
    createdAt: now,
    updatedAt: now,
  });

  return {
    success: true,
    message: "Calendar entry created.",
    data: { entryId: ref.id },
  };
});

/** Patch an entry. Every field is optional so a drag can send only the dates. */
export const updateCalendarEvent = onCall<
  {
    entryId?: string;
    title?: string;
    kind?: string;
    startAt?: number;
    endAt?: number | null;
    allDay?: boolean;
    location?: string | null;
  },
  Promise<CallableResponse>
>(async (request) => {
  const { uid } = requireAuth(request);
  const payload = request.data ?? {};
  if (!payload.entryId) {
    throw new HttpsError("invalid-argument", "entryId required.", {
      code: "VALIDATION_ERROR",
    });
  }

  const { ref, data } = await requireEntryAccess(payload.entryId, uid);
  const update: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (payload.title !== undefined) {
    if (!payload.title.trim()) {
      throw new HttpsError("invalid-argument", "Title cannot be empty.", {
        code: "VALIDATION_ERROR",
      });
    }
    update.title = payload.title.trim().slice(0, MAX_TITLE);
  }
  if (payload.kind !== undefined) {
    update.kind = coerce(payload.kind, KINDS, data.kind as Kind);
  }
  if (payload.allDay !== undefined) {
    update.allDay = payload.allDay === true;
  }
  if (payload.location !== undefined) {
    update.location = trimOrNull(payload.location, MAX_LOCATION);
  }

  // Dates are validated against each other, so the surviving value of whichever
  // side was not sent has to come from the stored document.
  if (payload.startAt !== undefined || payload.endAt !== undefined) {
    const start =
      payload.startAt !== undefined
        ? toDate(payload.startAt)
        : (data.startAt?.toDate() ?? null);
    const end =
      payload.endAt !== undefined
        ? toDate(payload.endAt)
        : (data.endAt?.toDate() ?? null);

    if (!start) {
      throw new HttpsError("invalid-argument", "startAt required.", {
        code: "VALIDATION_ERROR",
      });
    }
    assertOrdered(start, end);
    update.startAt = start;
    update.endAt = end;
  }

  await ref.update(update);
  return { success: true, message: "Calendar entry updated." };
});

export const deleteCalendarEvent = onCall<
  { entryId?: string },
  Promise<CallableResponse>
>(async (request) => {
  const { uid } = requireAuth(request);
  const entryId = request.data?.entryId;
  if (!entryId) {
    throw new HttpsError("invalid-argument", "entryId required.", {
      code: "VALIDATION_ERROR",
    });
  }
  const { ref } = await requireEntryAccess(entryId, uid);
  await ref.delete();
  return { success: true, message: "Calendar entry deleted." };
});

function assertOrdered(start: Date | null, end: Date | null) {
  if (start && end && end.getTime() < start.getTime()) {
    throw new HttpsError("invalid-argument", "End is before start.", {
      code: "VALIDATION_ERROR",
    });
  }
}

function coerce<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  fallback: T[number],
): T[number] {
  return allowed.includes(value as T[number]) ? (value as T[number]) : fallback;
}

function trimOrNull(value: string | null | undefined, max: number) {
  return value?.trim().slice(0, max) || null;
}

/** Dates cross the wire as epoch millis; Timestamps cannot be serialized. */
function toDate(value: number | null | undefined): Date | null {
  if (value === null || value === undefined) return null;
  const millis = Number(value);
  return Number.isFinite(millis) ? new Date(millis) : null;
}

export type { Kind };
