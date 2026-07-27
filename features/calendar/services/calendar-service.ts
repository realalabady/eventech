import { httpsCallable } from "firebase/functions";

import { getFirebaseFunctions } from "@/firebase/client";

import type { CalendarKind } from "../types";

/**
 * Calendar mutations are Cloud Function calls. The client never writes
 * `calendarEvents` directly — membership and the event's ownership are
 * re-checked server-side (canonical §7).
 */

export type CalendarResult<T = undefined> =
  { ok: true; data?: T } | { ok: false; errorKey: string };

const CODE_TO_KEY: Record<string, string> = {
  PERMISSION_DENIED: "permissionDenied",
  VALIDATION_ERROR: "validationFailed",
  NOT_FOUND: "notFound",
  AUTH_REQUIRED: "authRequired",
};

async function call<TPayload extends object, TData = undefined>(
  name: string,
  payload: TPayload,
): Promise<CalendarResult<TData>> {
  try {
    const fn = httpsCallable<TPayload, { data?: TData }>(
      getFirebaseFunctions(),
      name,
    );
    const response = await fn(payload);
    return { ok: true, data: response.data?.data };
  } catch (error) {
    const details =
      typeof error === "object" && error !== null && "details" in error
        ? (error as { details?: { code?: string } }).details
        : undefined;
    return {
      ok: false,
      errorKey: CODE_TO_KEY[details?.code ?? ""] ?? "unknown",
    };
  }
}

export type CalendarDraft = {
  title: string;
  kind: CalendarKind;
  /** Epoch millis — Timestamps cannot cross the callable boundary. */
  startAt: number;
  endAt: number | null;
  allDay: boolean;
  location: string | null;
  eventId: string | null;
};

export function createCalendarEvent(
  organizationId: string,
  draft: CalendarDraft,
) {
  return call<{ organizationId: string } & CalendarDraft, { entryId: string }>(
    "createCalendarEvent",
    { organizationId, ...draft },
  );
}

export function updateCalendarEvent(
  entryId: string,
  patch: Partial<Omit<CalendarDraft, "eventId">>,
) {
  return call("updateCalendarEvent", { entryId, ...patch });
}

export function deleteCalendarEvent(entryId: string) {
  return call("deleteCalendarEvent", { entryId });
}
