import type { Timestamp } from "firebase/firestore";

/**
 * Production milestones, seeded six-per-event by `createEvent`.
 *
 * The stage vocabulary is the seeded one, not guide 41's Idea→Execution list:
 * those documents have existed since Phase 4 and renaming would orphan them.
 */
export const TIMELINE_STAGES = [
  "planning",
  "venue",
  "artists",
  "production",
  "marketing",
  "published",
] as const;

export type TimelineStage = (typeof TIMELINE_STAGES)[number];

export type TimelineDoc = {
  id: string;
  eventId: string;
  organizationId: string;
  stage: TimelineStage;
  order: number;
  completed: boolean;
  completedAt: Timestamp | null;
};

/** Whole-number percentage, for the progress readout. */
export function completionPercent(stages: TimelineDoc[]): number {
  if (stages.length === 0) return 0;
  const done = stages.filter((stage) => stage.completed).length;
  return Math.round((done / stages.length) * 100);
}

/** The first incomplete stage — what the organizer should look at next. */
export function nextStage(stages: TimelineDoc[]): TimelineDoc | null {
  return (
    [...stages]
      .sort((a, b) => a.order - b.order)
      .find((stage) => !stage.completed) ?? null
  );
}
