import { httpsCallable } from "firebase/functions";

import { getFirebaseFunctions } from "@/firebase/client";

/**
 * Milestones are seeded by `createEvent` and never created or deleted from the
 * client — only their completion flag moves, so this is one narrow callable
 * rather than a general timeline writer.
 */
export type TimelineResult = { ok: true } | { ok: false; errorKey: string };

const CODE_TO_KEY: Record<string, string> = {
  PERMISSION_DENIED: "permissionDenied",
  VALIDATION_ERROR: "validationFailed",
  NOT_FOUND: "notFound",
  AUTH_REQUIRED: "authRequired",
};

export async function setTimelineStage(
  stageId: string,
  completed: boolean,
): Promise<TimelineResult> {
  try {
    const fn = httpsCallable<{ stageId: string; completed: boolean }, unknown>(
      getFirebaseFunctions(),
      "setTimelineStage",
    );
    await fn({ stageId, completed });
    return { ok: true };
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
