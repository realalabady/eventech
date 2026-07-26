import { httpsCallable } from "firebase/functions";

import { getFirebaseFunctions } from "@/firebase/client";

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

export function createEvent(organizationId: string, title?: string) {
  return call<{ organizationId: string; title?: string }, { eventId: string }>(
    "createEvent",
    { organizationId, title },
  );
}

export type EventPatch = {
  title?: string;
  description?: string;
  category?: string;
  venueId?: string;
  artistIds?: string[];
  startDate?: string;
  endDate?: string;
  ticketTypes?: Array<Omit<TicketType, "sold">>;
  coverImage?: string;
  branding?: { primary?: string };
};

export function saveEventDraft(eventId: string, patch: EventPatch) {
  return call("saveEventDraft", { eventId, patch });
}

export function publishEvent(eventId: string) {
  return call<{ eventId: string }, { slug: string }>("publishEvent", {
    eventId,
  });
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

export function createArtist(organizationId: string, name: string) {
  return call<{ organizationId: string; name: string }, { artistId: string }>(
    "createArtist",
    { organizationId, name },
  );
}
