import type { Timestamp } from "firebase/firestore";

import type { TaskPriority, TaskStatus } from "@/types/domain";

export type TaskDoc = {
  id: string;
  eventId: string;
  organizationId: string;
  /** Free text on user-created tasks. Null on seeded ones — see `titleKey`. */
  title: string | null;
  /** i18n key on tasks seeded by `createEvent`. Null once renamed. */
  titleKey: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: Timestamp | null;
  createdAt: Timestamp | null;
};

/**
 * Kanban columns are the task statuses, in workflow order.
 * Canonical §4 fixes this list and explicitly overrides guide 41's
 * "Doing / Completed" wording.
 */
export const TASK_COLUMNS: TaskStatus[] = [
  "todo",
  "in_progress",
  "review",
  "done",
];

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

/** Highest priority first, then soonest due date, then oldest. */
export function compareTasks(a: TaskDoc, b: TaskDoc): number {
  const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  if (byPriority !== 0) return byPriority;

  const aDue = a.dueDate?.toMillis() ?? Infinity;
  const bDue = b.dueDate?.toMillis() ?? Infinity;
  if (aDue !== bDue) return aDue - bDue;

  return (a.createdAt?.toMillis() ?? 0) - (b.createdAt?.toMillis() ?? 0);
}

/** A task is overdue only if it still has work left. */
export function isOverdue(task: TaskDoc, now: number): boolean {
  if (task.status === "done" || !task.dueDate) return false;
  return task.dueDate.toMillis() < now;
}
