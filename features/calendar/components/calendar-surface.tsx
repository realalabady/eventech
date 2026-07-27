"use client";

import { Calendar } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import listPlugin from "@fullcalendar/react/list";
import arLocale from "@fullcalendar/react/locales/ar";
import classicTheme from "@fullcalendar/react/themes/classic";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import { useMemo } from "react";

import "@fullcalendar/react/skeleton.css";
// The classic theme's *structure* only — its palette.css is deliberately not
// imported. `calendar-theme.css` supplies every colour from our tokens instead.
import "@fullcalendar/react/themes/classic/theme.css";
import "../styles/calendar-theme.css";

import { isEditable, type CalendarItem } from "../types";

const PLUGINS = [
  classicTheme,
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  interactionPlugin,
];

/**
 * The FullCalendar instance itself, isolated in its own module.
 *
 * Nothing imports this directly — `production-calendar.tsx` pulls it in through
 * `next/dynamic` so FullCalendar and its Temporal polyfill stay out of the
 * initial bundle (canonical §11's 250KB budget). Same reasoning as the door
 * scanner's deferred `qr-scanner` import.
 */
export function CalendarSurface({
  items,
  rtl,
  onOpen,
  onCreateAt,
}: {
  items: CalendarItem[];
  rtl: boolean;
  onOpen: (item: CalendarItem) => void;
  onCreateAt: (startMillis: number, allDay: boolean) => void;
}) {
  const events = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        title: item.title,
        start: new Date(item.start),
        end: item.end ? new Date(item.end) : undefined,
        allDay: item.allDay,
        // v7 renamed this from v6's `classNames` and takes a string rather than
        // an array. The old key still type-checks — `EventInput` has an index
        // signature for extended props — so it was silently swallowed there,
        // and every entry rendered unstyled.
        className: [
          `fc-item-${item.source === "entry" ? (item.kind ?? "other") : item.source}`,
          isEditable(item) ? "fc-item-editable" : "fc-item-readonly",
        ].join(" "),
      })),
    [items],
  );

  const byId = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );

  return (
    <div className="evntech-calendar">
      <Calendar
        plugins={PLUGINS}
        initialView="dayGridMonth"
        // Toolbar labels, month and day names come from FullCalendar's own
        // locale data — the same category of vendored strings as shadcn's, and
        // already translated. English is its default and needs no import.
        locale={rtl ? arLocale : undefined}
        direction={rtl ? "rtl" : "ltr"}
        // Saturday, in both locales. The Gulf working week runs Sunday–Thursday,
        // so a Monday-first grid puts the weekend in the middle of the row.
        firstDay={6}
        height="auto"
        headerToolbar={{
          start: "prev,next today",
          center: "title",
          end: "dayGridMonth,timeGridWeek,listMonth",
        }}
        events={events}
        nowIndicator
        dayMaxEvents={3}
        selectable
        eventClick={(info) => {
          const item = byId.get(info.event.id);
          if (item) onOpen(item);
        }}
        dateClick={(info) => onCreateAt(info.date.valueOf(), info.allDay)}
      />
    </div>
  );
}
