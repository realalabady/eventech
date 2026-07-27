import type { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";

import {
  CALENDAR_KINDS,
  compareItems,
  entryToItem,
  exclusiveEnd,
  isEditable,
  type CalendarEntryDoc,
  type CalendarItem,
} from "@/features/calendar/types";

import ar from "../messages/ar.json";
import en from "../messages/en.json";

const NOW = Date.UTC(2026, 6, 27, 12, 0, 0);
const HOUR = 60 * 60 * 1000;

function stamp(millis: number): Timestamp {
  return { toMillis: () => millis } as Timestamp;
}

function entry(overrides: Partial<CalendarEntryDoc> = {}): CalendarEntryDoc {
  return {
    id: "c1",
    organizationId: "o1",
    eventId: null,
    title: "Production meeting",
    kind: "meeting",
    startAt: stamp(NOW),
    endAt: null,
    allDay: false,
    location: null,
    ...overrides,
  };
}

function item(overrides: Partial<CalendarItem> = {}): CalendarItem {
  return {
    id: "entry:c1",
    source: "entry",
    refId: "c1",
    title: "Production meeting",
    start: NOW,
    end: null,
    allDay: false,
    kind: "meeting",
    ...overrides,
  };
}

describe("entryToItem", () => {
  it("namespaces the id by source so a task and an entry cannot collide", () => {
    expect(entryToItem(entry())?.id).toBe("entry:c1");
  });

  it("carries the instants across as epoch millis", () => {
    const converted = entryToItem(
      entry({ startAt: stamp(NOW), endAt: stamp(NOW + HOUR) }),
    );
    expect(converted?.start).toBe(NOW);
    expect(converted?.end).toBe(NOW + HOUR);
  });

  it("drops an entry with no start rather than rendering it at the epoch", () => {
    expect(entryToItem(entry({ startAt: null }))).toBeNull();
  });
});

describe("compareItems", () => {
  it("orders chronologically regardless of source", () => {
    const ordered = [
      item({ id: "c", start: NOW + 2 * HOUR }),
      item({ id: "a", source: "task", start: NOW }),
      item({ id: "b", source: "event", start: NOW + HOUR }),
    ].sort(compareItems);

    expect(ordered.map((each) => each.id)).toEqual(["a", "b", "c"]);
  });
});

describe("isEditable", () => {
  it("allows real entries", () => {
    expect(isEditable(item())).toBe(true);
  });

  // Task due dates and event dates are projections of data owned elsewhere.
  // Editing them here would write to the wrong collection.
  it.each(["task", "event"] as const)("refuses %s projections", (source) => {
    expect(isEditable(item({ source }))).toBe(false);
  });
});

describe("exclusiveEnd", () => {
  it("leaves a timed entry's end exactly where it was", () => {
    const end = exclusiveEnd(item({ end: NOW + HOUR, allDay: false }));
    expect(end?.getTime()).toBe(NOW + HOUR);
  });

  // FullCalendar's all-day end is exclusive, so an entry stored as ending on
  // the 30th must be handed the 31st or it paints only through the 29th.
  it("advances an all-day end by one calendar day", () => {
    const stored = new Date(2026, 6, 30, 0, 0, 0).getTime();
    const end = exclusiveEnd(item({ end: stored, allDay: true }));
    expect(end?.getDate()).toBe(31);
    expect(end?.getMonth()).toBe(6);
  });

  it("rolls an all-day end across a month boundary", () => {
    const stored = new Date(2026, 6, 31, 0, 0, 0).getTime();
    const end = exclusiveEnd(item({ end: stored, allDay: true }));
    expect(end?.getMonth()).toBe(7);
    expect(end?.getDate()).toBe(1);
  });

  it("stays undefined when the entry has no end", () => {
    expect(exclusiveEnd(item({ end: null }))).toBeUndefined();
  });
});

describe("calendar translations", () => {
  it("names every kind in both locales", () => {
    for (const kind of CALENDAR_KINDS) {
      expect(en.calendar.kind).toHaveProperty(kind);
      expect(ar.calendar.kind).toHaveProperty(kind);
    }
  });

  it("names every legend entry in both locales", () => {
    for (const key of ["meeting", "setup", "deadline", "task", "event"]) {
      expect(en.calendar.legend).toHaveProperty(key);
      expect(ar.calendar.legend).toHaveProperty(key);
    }
  });
});
