import { httpsCallable } from "firebase/functions";

import { getFirebaseFunctions } from "@/firebase/client";

/**
 * Messaging mutations are Cloud Function calls. The client never writes
 * `channels` or `messages` — membership is re-checked server-side from
 * Firestore, so a member of one org cannot post into another's (canonical §7).
 */

export type MessagingResult<T = undefined> =
  { ok: true; data?: T } | { ok: false; errorKey: string };

const CODE_TO_KEY: Record<string, string> = {
  PERMISSION_DENIED: "permissionDenied",
  VALIDATION_ERROR: "validationFailed",
  NOT_FOUND: "notFound",
  AUTH_REQUIRED: "authRequired",
  ALREADY_EXISTS: "nameTaken",
};

async function call<TPayload extends object, TData = undefined>(
  name: string,
  payload: TPayload,
): Promise<MessagingResult<TData>> {
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

export function createChannel(
  organizationId: string,
  name: string,
  topic: string | null,
  eventId: string | null,
) {
  return call<
    {
      organizationId: string;
      name: string;
      topic: string | null;
      eventId: string | null;
    },
    { channelId: string }
  >("createChannel", { organizationId, name, topic, eventId });
}

export function sendMessage(channelId: string, body: string) {
  return call<{ channelId: string; body: string }, { messageId: string }>(
    "sendMessage",
    { channelId, body },
  );
}
