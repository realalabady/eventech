import type { Timestamp } from "firebase/firestore";

/**
 * Activity log shape is fixed by canonical §5:
 * `actorId, action, resourceType, resourceId, metadata, createdAt`.
 */
export type ActivityDoc = {
  id: string;
  organizationId: string;
  eventId: string | null;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  createdAt: Timestamp | null;
};

/**
 * Actions with a translated sentence in `messages/*.json`. Anything written by
 * a future phase renders through a generic fallback rather than a raw key, so
 * an unknown action degrades quietly instead of leaking internals to the user.
 */
export const KNOWN_ACTIONS = [
  "createEvent",
  "publishEvent",
  "approveBooking",
  "generateTicket",
  "checkInTicket",
  "moveTask",
  "completeMilestone",
  "reopenMilestone",
] as const;

export function isKnownAction(action: string): boolean {
  return (KNOWN_ACTIONS as readonly string[]).includes(action);
}
