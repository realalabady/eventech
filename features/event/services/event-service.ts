import { httpsCallable } from "firebase/functions";
import { track } from "@/firebase/analytics";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import {
  getFirebaseAuth,
  getFirebaseFunctions,
  getFirebaseStorage,
} from "@/firebase/client";

import type { TicketType } from "../types";

/**
 * All event mutations are Cloud Function calls — the client never writes to
 * `events`, `venues` or `artists` (canonical §7). Errors surface as i18n keys
 * under `event.errors.*`.
 */

export type EventResult<T = undefined> =
  { ok: true; data?: T } | { ok: false; errorKey: string; missing?: string[] };

const CODE_TO_KEY: Record<string, string> = {
  ALREADY_EXISTS: "alreadyExists",
  PERMISSION_DENIED: "permissionDenied",
  VALIDATION_ERROR: "validationFailed",
  NOT_FOUND: "notFound",
  AUTH_REQUIRED: "authRequired",
  EVENT_INCOMPLETE: "eventIncomplete",
  PAYMENT_DETAILS_REQUIRED: "paymentDetailsRequired",
  EMAIL_NOT_VERIFIED: "emailNotVerified",
};

type ErrorDetails = { code?: string; missing?: string[] };

function toError(error: unknown): { errorKey: string; missing?: string[] } {
  const details =
    typeof error === "object" && error !== null && "details" in error
      ? ((error as { details?: ErrorDetails }).details ?? {})
      : {};
  return {
    errorKey: CODE_TO_KEY[details.code ?? ""] ?? "unknown",
    missing: details.missing,
  };
}

async function call<TPayload extends object, TData = undefined>(
  name: string,
  payload: TPayload,
): Promise<EventResult<TData>> {
  try {
    const fn = httpsCallable<TPayload, { success: boolean; data?: TData }>(
      getFirebaseFunctions(),
      name,
    );
    const response = await fn(payload);
    return { ok: true, data: response.data?.data };
  } catch (error) {
    return { ok: false, ...toError(error) };
  }
}

export async function createEvent(organizationId: string, title?: string) {
  const result = await call<
    { organizationId: string; title?: string },
    { eventId: string }
  >("createEvent", { organizationId, title });
  // Funnel step 4. The title is organizer-authored free text and is not sent.
  if (result.ok) track(AnalyticsEvent.EVENT_CREATED);
  return result;
}

export type EventPatch = {
  title?: string;
  description?: string;
  category?: string;
  venueId?: string;
  artistIds?: string[];
  /** ISO 8601 instants with offset — see ScheduleStep for the conversion. */
  startDate?: string;
  endDate?: string;
  timezone?: string;
  ticketTypes?: Array<Omit<TicketType, "sold">>;
  coverImage?: string;
  branding?: { primary?: string };
};

export async function saveEventDraft(eventId: string, patch: EventPatch) {
  const result = await call("saveEventDraft", { eventId, patch });
  // Which fields changed, never their values — a patch carries descriptions,
  // ticket prices and branding.
  if (result.ok) {
    track(AnalyticsEvent.EVENT_EDITED, { fields: Object.keys(patch).join(",") });
  }
  return result;
}

export async function publishEvent(eventId: string) {
  const result = await call<{ eventId: string }, { slug: string }>(
    "publishEvent",
    { eventId },
  );
  // Funnel step 6 — the terminal conversion.
  if (result.ok) track(AnalyticsEvent.EVENT_PUBLISHED, { eventId });
  return result;
}

export function createVenue(
  organizationId: string,
  venue: { name: string; address: string; city: string },
) {
  return call<typeof venue & { organizationId: string }, { venueId: string }>(
    "createVenue",
    { organizationId, ...venue },
  );
}

/**
 * Uploads the event cover and records its URL. Storage rules re-check role,
 * content type and size server-side; this validation is only for fast feedback.
 */
export async function uploadEventCover(
  eventId: string,
  file: File,
): Promise<EventResult<{ url: string }>> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    return { ok: false, errorKey: "invalidImageType" };
  }
  if (file.size > 20 * 1024 * 1024) {
    return { ok: false, errorKey: "imageTooLarge" };
  }

  const uid = getFirebaseAuth().currentUser?.uid;
  if (!uid) {
    return { ok: false, errorKey: "authRequired" };
  }

  try {
    const extension = file.type.split("/")[1];
    // uid-namespaced so Storage rules verify ownership by path; saveEventDraft
    // enforces organization membership before the URL is stored.
    const storageRef = ref(
      getFirebaseStorage(),
      `events/${eventId}/cover/${uid}/cover.${extension}`,
    );
    await uploadBytes(storageRef, file, { contentType: file.type });
    const url = await getDownloadURL(storageRef);
    const saved = await saveEventDraft(eventId, { coverImage: url });
    if (!saved.ok) return saved as EventResult<{ url: string }>;
    return { ok: true, data: { url } };
  } catch (error) {
    return { ok: false, ...toError(error) };
  }
}

export function createArtist(organizationId: string, name: string) {
  return call<{ organizationId: string; name: string }, { artistId: string }>(
    "createArtist",
    { organizationId, name },
  );
}
