import type { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";

import {
  compareChannels,
  startsNewGroup,
  type ChannelDoc,
  type MessageDoc,
} from "@/features/messaging/types";

const NOW = Date.UTC(2026, 6, 27, 12, 0, 0);
const MINUTE = 60_000;

function stamp(millis: number): Timestamp {
  return { toMillis: () => millis } as Timestamp;
}

function channel(overrides: Partial<ChannelDoc> = {}): ChannelDoc {
  return {
    id: "ch1",
    organizationId: "o1",
    eventId: null,
    name: "production",
    topic: null,
    lastMessageAt: stamp(NOW),
    ...overrides,
  };
}

function message(overrides: Partial<MessageDoc> = {}): MessageDoc {
  return {
    id: "m1",
    channelId: "ch1",
    organizationId: "o1",
    authorId: "u1",
    body: "On my way",
    createdAt: stamp(NOW),
    ...overrides,
  };
}

describe("compareChannels", () => {
  it("puts the most recently active channel first", () => {
    const ordered = [
      channel({ id: "quiet", lastMessageAt: stamp(NOW - MINUTE) }),
      channel({ id: "busy", lastMessageAt: stamp(NOW) }),
    ].sort(compareChannels);

    expect(ordered.map((each) => each.id)).toEqual(["busy", "quiet"]);
  });

  it("falls back to the name when neither has been posted in", () => {
    const ordered = [
      channel({ id: "b", name: "stage", lastMessageAt: null }),
      channel({ id: "a", name: "lighting", lastMessageAt: null }),
    ].sort(compareChannels);

    expect(ordered.map((each) => each.name)).toEqual(["lighting", "stage"]);
  });
});

describe("startsNewGroup", () => {
  it("starts a group for the first message in a thread", () => {
    expect(startsNewGroup(message(), undefined)).toBe(true);
  });

  it("starts a group when the author changes", () => {
    const previous = message({ authorId: "u2" });
    expect(startsNewGroup(message({ authorId: "u1" }), previous)).toBe(true);
  });

  it("keeps a rapid burst from one author in a single block", () => {
    const previous = message({ createdAt: stamp(NOW - MINUTE) });
    expect(startsNewGroup(message({ createdAt: stamp(NOW) }), previous)).toBe(
      false,
    );
  });

  it("starts a new group once the author has been quiet a while", () => {
    const previous = message({ createdAt: stamp(NOW - 6 * MINUTE) });
    expect(startsNewGroup(message({ createdAt: stamp(NOW) }), previous)).toBe(
      true,
    );
  });
});
