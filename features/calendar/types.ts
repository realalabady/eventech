import type { Timestamp } from "firebase/firestore";

/** Entry kinds (guide 41's unified production calendar: meetings, deadlines, setup). */
export const CALENDAR_KINDS = [
  "meeting",
  "deadline",
  "setup",
  "other",
] as const;
export type CalendarKind = (typeof CALENDAR_KINDS)[number];

export type CalendarEntryDoc = {
  id: string;
  organizationId: string;
  /** Entries may be organization-wide rather than tied to one event. */
  eventId: string | null;
  title: string;
  kind: CalendarKind;
  startAt: Timestamp | null;
  endAt: Timestamp | null;
  allDay: boolean;
  location: string | null;
};

/**
 * Where a calendar item came from.
 *
 * Guide 41 asks for a *unified* calendar, and the handover is explicit that
 * task due dates and event dates should feed this view rather than be copied
 * into it. So only `entry` items are real `calendarEvents` documents; the other
 * two are projections of data that already exists and are read-only here —
 * a task's due date is edited on the board, not on the calendar.
 */
export type CalendarSource = "entry" | "task" | "event";

/** The neutral shape the calendar renders, independent of where it came from. */
export type CalendarItem = {
  /** Prefixed by source, so a task and an entry can never collide. */
  id: string;
  source: CalendarSource;
  /** Document id within its own collection. */
  refId: string;
  title: string;
  /** Epoch millis — Timestamps do not survive the render boundary. */
  start: number;
  end: number | null;
  allDay: boolean;
  kind: CalendarKind | null;
};

/** Newest first is wrong for a calendar; chronological is the only sane order. */
export function compareItems(a: CalendarItem, b: CalendarItem): number {
  return a.start - b.start;
}

export function entryToItem(entry: CalendarEntryDoc): CalendarItem | null {
  const start = entry.startAt?.toMillis();
  if (!start) return null;
  return {
    id: `entry:${entry.id}`,
    source: "entry",
    refId: entry.id,
    title: entry.title,
    start,
    end: entry.endAt?.toMillis() ?? null,
    allDay: entry.allDay,
    kind: entry.kind,
  };
}

/** Only real entries can be edited; projections belong to their own feature. */
export function isEditable(item: CalendarItem): boolean {
  return item.source === "entry";
}

/**
 * The `end` a calendar renderer should be given.
 *
 * FullCalendar treats an all-day `end` as **exclusive**, so an entry stored as
 * ending on the 30th would paint only through the 29th and read a day shorter
 * than it is. Timed entries keep their instant untouched.
 *
 * The day is added through the date parts rather than by adding 24h, so a range
 * spanning a daylight-saving change still lands on the right calendar day.
 */
export function exclusiveEnd(item: CalendarItem): Date | undefined {
  if (item.end === null) return undefined;
  const end = new Date(item.end);
  if (item.allDay) end.setDate(end.getDate() + 1);
  return end;
}
