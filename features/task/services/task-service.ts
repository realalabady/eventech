import { httpsCallable } from "firebase/functions";

import { getFirebaseFunctions } from "@/firebase/client";

import type { TaskDoc } from "../types";

/**
 * Task mutations are Cloud Function calls. The client never writes `tasks`
 * directly — `organizationId` and event ownership are re-checked server-side
 * (canonical §7), so a member of one org cannot touch another's board.
 */

export type TaskResult<T = undefined> =
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
): Promise<TaskResult<TData>> {
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

export type TaskDraft = {
  title: string;
  status: TaskDoc["status"];
  priority: TaskDoc["priority"];
  assigneeId: string | null;
  /** Epoch millis — Timestamps cannot cross the callable boundary. */
  dueDate: number | null;
};

export function createTask(
  eventId: string,
  organizationId: string,
  draft: TaskDraft,
) {
  return call<
    { eventId: string; organizationId: string } & TaskDraft,
    { taskId: string }
  >("createTask", { eventId, organizationId, ...draft });
}

export function updateTask(taskId: string, patch: Partial<TaskDraft>) {
  return call("updateTask", { taskId, ...patch });
}

export function deleteTask(taskId: string) {
  return call("deleteTask", { taskId });
}
