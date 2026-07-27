import type { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";

import { isKnownAction } from "@/features/activity/types";
import {
  compareTasks,
  isOverdue,
  TASK_COLUMNS,
  type TaskDoc,
} from "@/features/task/types";
import {
  completionPercent,
  nextStage,
  TIMELINE_STAGES,
  type TimelineDoc,
} from "@/features/timeline/types";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/types/domain";

import ar from "../messages/ar.json";
import en from "../messages/en.json";

const NOW = Date.UTC(2026, 6, 27, 12, 0, 0);
const DAY = 24 * 60 * 60 * 1000;

function stamp(millis: number): Timestamp {
  return { toMillis: () => millis } as Timestamp;
}

function task(overrides: Partial<TaskDoc> = {}): TaskDoc {
  return {
    id: "t1",
    eventId: "e1",
    organizationId: "o1",
    title: "Confirm the venue",
    titleKey: null,
    status: "todo",
    priority: "medium",
    assigneeId: null,
    dueDate: null,
    createdAt: stamp(NOW),
    ...overrides,
  };
}

function stage(order: number, completed: boolean): TimelineDoc {
  return {
    id: `s${order}`,
    eventId: "e1",
    organizationId: "o1",
    stage: TIMELINE_STAGES[order],
    order,
    completed,
    completedAt: null,
  };
}

describe("kanban columns", () => {
  it("matches the canonical task statuses exactly", () => {
    // Canonical §4 overrides guide 41's "Doing / Completed" wording.
    expect(TASK_COLUMNS).toEqual([...TASK_STATUSES]);
  });
});

describe("task ordering", () => {
  it("puts higher priority first", () => {
    const high = task({ id: "a", priority: "high" });
    const low = task({ id: "b", priority: "low" });
    expect([low, high].sort(compareTasks)[0].id).toBe("a");
  });

  it("breaks priority ties with the sooner due date", () => {
    const later = task({ id: "a", dueDate: stamp(NOW + 2 * DAY) });
    const sooner = task({ id: "b", dueDate: stamp(NOW + DAY) });
    expect([later, sooner].sort(compareTasks)[0].id).toBe("b");
  });

  it("sinks undated tasks below dated ones of equal priority", () => {
    const undated = task({ id: "a", dueDate: null });
    const dated = task({ id: "b", dueDate: stamp(NOW + 5 * DAY) });
    expect([undated, dated].sort(compareTasks)[0].id).toBe("b");
  });
});

describe("overdue", () => {
  it("flags an unfinished task past its due date", () => {
    expect(isOverdue(task({ dueDate: stamp(NOW - DAY) }), NOW)).toBe(true);
  });

  it("never flags a completed task, however late", () => {
    // Finished work is not outstanding work — a red badge here would be noise.
    expect(
      isOverdue(task({ status: "done", dueDate: stamp(NOW - DAY) }), NOW),
    ).toBe(false);
  });

  it("does not flag a task with no due date", () => {
    expect(isOverdue(task({ dueDate: null }), NOW)).toBe(false);
  });
});

describe("timeline progress", () => {
  it("reports a whole-number percentage", () => {
    const stages = [stage(0, true), stage(1, true), stage(2, false)];
    expect(completionPercent(stages)).toBe(67);
  });

  it("returns 0 for an event with no milestones rather than dividing by zero", () => {
    expect(completionPercent([])).toBe(0);
  });

  it("picks the first incomplete stage by order, not array position", () => {
    const stages = [stage(2, false), stage(0, true), stage(1, false)];
    expect(nextStage(stages)?.order).toBe(1);
  });

  it("returns null once everything is done", () => {
    expect(nextStage([stage(0, true), stage(1, true)])).toBeNull();
  });
});

describe("activity actions", () => {
  it("recognises the actions the backend actually writes", () => {
    for (const action of [
      "createEvent",
      "approveBooking",
      "generateTicket",
      "checkInTicket",
      "moveTask",
      "completeMilestone",
    ]) {
      expect(isKnownAction(action)).toBe(true);
    }
  });

  it("treats an unrecognised action as unknown so it can fall back", () => {
    expect(isKnownAction("somethingFromAFuturePhase")).toBe(false);
  });
});

describe("i18n coverage", () => {
  it("every task status and priority has a label in both locales", () => {
    for (const status of TASK_STATUSES) {
      expect(en.task.status).toHaveProperty(status);
      expect(ar.task.status).toHaveProperty(status);
    }
    for (const priority of TASK_PRIORITIES) {
      expect(en.task.priority).toHaveProperty(priority);
      expect(ar.task.priority).toHaveProperty(priority);
    }
  });

  it("every timeline stage has a label in both locales", () => {
    for (const name of TIMELINE_STAGES) {
      expect(en.timeline.stage).toHaveProperty(name);
      expect(ar.timeline.stage).toHaveProperty(name);
    }
  });

  it("every known activity action has a sentence in both locales", () => {
    for (const action of Object.keys(en.activity.action)) {
      expect(ar.activity.action).toHaveProperty(action);
    }
  });
});
