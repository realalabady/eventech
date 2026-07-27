import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import type { CallableResponse } from "../lib/errors";
import { requireAuth, requireMemberRole } from "../lib/organization-guards";

const STATUSES = ["todo", "in_progress", "review", "done"] as const;
const PRIORITIES = ["low", "medium", "high"] as const;

type Status = (typeof STATUSES)[number];
type Priority = (typeof PRIORITIES)[number];

/** Everyone who works the event can move tasks; scanners only work the door. */
const TASK_ROLES = ["owner", "manager", "staff"] as const;

const MAX_TITLE = 140;

/**
 * Loads a task and confirms the caller may act on it. Membership is read from
 * Firestore rather than trusted from the payload (canonical §7), and the task's
 * own organizationId is the authority — never one supplied by the client.
 */
async function requireTaskAccess(taskId: string, uid: string) {
  const ref = getFirestore().collection("tasks").doc(taskId);
  const data = (await ref.get()).data();
  if (!data) {
    throw new HttpsError("not-found", "Task not found.", { code: "NOT_FOUND" });
  }
  await requireMemberRole(data.organizationId, uid, [...TASK_ROLES]);
  return { ref, data };
}

export const createTask = onCall<
  {
    eventId?: string;
    organizationId?: string;
    title?: string;
    status?: string;
    priority?: string;
    assigneeId?: string | null;
    dueDate?: number | null;
  },
  Promise<CallableResponse<{ taskId: string }>>
>(async (request) => {
  const { uid } = requireAuth(request);
  const { eventId, organizationId, title } = request.data ?? {};

  if (!eventId || !organizationId || !title?.trim()) {
    throw new HttpsError("invalid-argument", "Missing task fields.", {
      code: "VALIDATION_ERROR",
    });
  }
  await requireMemberRole(organizationId, uid, [...TASK_ROLES]);

  const event = (
    await getFirestore().collection("events").doc(eventId).get()
  ).data();
  // Without this a member of org A could hang a task off org B's event.
  if (!event || event.organizationId !== organizationId) {
    throw new HttpsError("not-found", "Event not found.", {
      code: "NOT_FOUND",
    });
  }

  const status = coerce(request.data?.status, STATUSES, "todo");
  const priority = coerce(request.data?.priority, PRIORITIES, "medium");
  const now = FieldValue.serverTimestamp();

  const ref = getFirestore().collection("tasks").doc();
  await ref.set({
    eventId,
    organizationId,
    // Seeded tasks carry `titleKey` and are translated; user-created tasks
    // carry free text. The UI renders whichever is present.
    title: title.trim().slice(0, MAX_TITLE),
    titleKey: null,
    status,
    priority,
    assigneeId: request.data?.assigneeId ?? null,
    dueDate: toTimestampMillis(request.data?.dueDate),
    createdBy: uid,
    createdAt: now,
    updatedAt: now,
  });

  return { success: true, message: "Task created.", data: { taskId: ref.id } };
});

/**
 * Patch a task. Every field is optional so the Kanban can send only `status`
 * on a drag, while the edit dialog sends the rest.
 */
export const updateTask = onCall<
  {
    taskId?: string;
    title?: string;
    status?: string;
    priority?: string;
    assigneeId?: string | null;
    dueDate?: number | null;
  },
  Promise<CallableResponse>
>(async (request) => {
  const { uid } = requireAuth(request);
  const payload = request.data ?? {};
  if (!payload.taskId) {
    throw new HttpsError("invalid-argument", "taskId required.", {
      code: "VALIDATION_ERROR",
    });
  }

  const { ref, data } = await requireTaskAccess(payload.taskId, uid);
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
    update.titleKey = null; // renaming a seeded task makes it a custom one
  }
  if (payload.status !== undefined) {
    update.status = coerce(payload.status, STATUSES, data.status);
  }
  if (payload.priority !== undefined) {
    update.priority = coerce(payload.priority, PRIORITIES, data.priority);
  }
  if (payload.assigneeId !== undefined) {
    update.assigneeId = payload.assigneeId || null;
  }
  if (payload.dueDate !== undefined) {
    update.dueDate = toTimestampMillis(payload.dueDate);
  }

  await ref.update(update);

  // Kanban movement is the activity feed's most useful signal (guide 41), so
  // status changes are logged; renames and priority tweaks are noise.
  if (update.status && update.status !== data.status) {
    await getFirestore()
      .collection("activityLogs")
      .add({
        organizationId: data.organizationId,
        eventId: data.eventId,
        actorId: uid,
        action: "moveTask",
        resourceType: "task",
        resourceId: payload.taskId,
        metadata: { from: data.status, to: update.status },
        createdAt: FieldValue.serverTimestamp(),
      });
  }

  return { success: true, message: "Task updated." };
});

export const deleteTask = onCall<
  { taskId?: string },
  Promise<CallableResponse>
>(async (request) => {
  const { uid } = requireAuth(request);
  const taskId = request.data?.taskId;
  if (!taskId) {
    throw new HttpsError("invalid-argument", "taskId required.", {
      code: "VALIDATION_ERROR",
    });
  }
  const { ref } = await requireTaskAccess(taskId, uid);
  await ref.delete();
  return { success: true, message: "Task deleted." };
});

function coerce<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  fallback: T[number],
): T[number] {
  return allowed.includes(value as T[number]) ? (value as T[number]) : fallback;
}

/** Dates cross the wire as epoch millis; Timestamps cannot be serialized. */
function toTimestampMillis(value: number | null | undefined) {
  if (value === null || value === undefined) return null;
  const millis = Number(value);
  return Number.isFinite(millis) ? new Date(millis) : null;
}

export type { Status, Priority };
