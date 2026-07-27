import type { Timestamp } from "firebase/firestore";

/**
 * Team communication is `channels` + `messages` (canonical §5), and §13
 * explicitly rejects guide 45's `conversations` collection.
 */

export type ChannelDoc = {
  id: string;
  organizationId: string;
  /** A channel may be about one event, or about the organization at large. */
  eventId: string | null;
  name: string;
  topic: string | null;
  lastMessageAt: Timestamp | null;
};

export type MessageDoc = {
  id: string;
  channelId: string;
  organizationId: string;
  authorId: string;
  body: string;
  createdAt: Timestamp | null;
};

/** Busiest channel first; a channel nobody has posted in sorts by its name. */
export function compareChannels(a: ChannelDoc, b: ChannelDoc): number {
  const byActivity =
    (b.lastMessageAt?.toMillis() ?? 0) - (a.lastMessageAt?.toMillis() ?? 0);
  return byActivity !== 0 ? byActivity : a.name.localeCompare(b.name);
}

/**
 * Consecutive messages from one author within this window render as a single
 * block, so a burst of short lines does not repeat the name five times.
 */
const GROUPING_WINDOW_MS = 5 * 60_000;

export function startsNewGroup(
  message: MessageDoc,
  previous: MessageDoc | undefined,
): boolean {
  if (!previous || previous.authorId !== message.authorId) return true;
  const gap =
    (message.createdAt?.toMillis() ?? 0) -
    (previous.createdAt?.toMillis() ?? 0);
  return gap > GROUPING_WINDOW_MS;
}
