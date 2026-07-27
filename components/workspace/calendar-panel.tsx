"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { CalendarDialog } from "@/features/calendar/components/calendar-dialog";
import { ProductionCalendar } from "@/features/calendar/components/production-calendar";
import { useCalendarEntries } from "@/features/calendar/hooks/use-calendar";
import {
  compareItems,
  entryToItem,
  type CalendarEntryDoc,
  type CalendarItem,
} from "@/features/calendar/types";
import { useEvents } from "@/features/event/hooks/use-events";
import { useOrganization } from "@/features/organization/hooks/use-organization";
import { useOrganizationTasks } from "@/features/task/hooks/use-tasks";

/**
 * Composition layer for the unified production calendar.
 *
 * Guide 41 wants one calendar, not three. Task due dates and event dates are
 * *projected* into it here rather than copied into `calendarEvents` — the
 * calendar, task, event and organization features stay unaware of each other
 * (canonical §11), and there is no second copy of a due date to drift.
 */
export function CalendarPanel() {
  const t = useTranslations("calendar");
  const tTask = useTranslations("task");
  const { organization } = useOrganization();

  const { entries, loading, failed } = useCalendarEntries(organization?.id);
  const { tasks, failed: tasksFailed } = useOrganizationTasks(organization?.id);
  // `useEvents` omits `failed` on its early-return branches, hence the default.
  const { events, failed: eventsFailed = false } = useEvents(organization?.id);

  const [editing, setEditing] = useState<CalendarEntryDoc | null>(null);
  const [seed, setSeed] = useState<{ start: number | null; allDay: boolean }>({
    start: null,
    allDay: true,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  // Bumped on every open so the dialog remounts with a clean form rather than
  // resurrecting an abandoned draft (gotcha #9).
  const [session, setSession] = useState(0);

  const items = useMemo<CalendarItem[]>(() => {
    const fromEntries = entries
      .map(entryToItem)
      .filter((item): item is CalendarItem => item !== null);

    const fromTasks = tasks.flatMap<CalendarItem>((task) => {
      const due = task.dueDate?.toMillis();
      if (!due) return [];
      return [
        {
          id: `task:${task.id}`,
          source: "task",
          refId: task.id,
          title: task.titleKey
            ? tTask(`seeded.${task.titleKey}`)
            : (task.title ?? ""),
          start: due,
          end: null,
          allDay: true,
          kind: null,
        },
      ];
    });

    const fromEvents = events.flatMap<CalendarItem>((event) => {
      const start = event.startDate?.toMillis();
      if (!start) return [];
      return [
        {
          id: `event:${event.id}`,
          source: "event",
          refId: event.id,
          title: event.title,
          start,
          end: event.endDate?.toMillis() ?? null,
          allDay: false,
          kind: null,
        },
      ];
    });

    return [...fromEntries, ...fromTasks, ...fromEvents].sort(compareItems);
  }, [entries, tasks, events, tTask]);

  const eventOptions = useMemo(
    () => events.map((event) => ({ id: event.id, title: event.title })),
    [events],
  );

  function openNew(start: number | null, allDay: boolean) {
    setEditing(null);
    setSeed({ start, allDay });
    setSession((count) => count + 1);
    setDialogOpen(true);
  }

  function openItem(item: CalendarItem) {
    // Projections are read-only here — a due date is edited on the board.
    if (item.source !== "entry") return;
    const entry = entries.find((candidate) => candidate.id === item.refId);
    if (!entry) return;
    setEditing(entry);
    setSession((count) => count + 1);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{t("hint")}</p>
        <Button
          size="sm"
          onClick={() => openNew(Date.now(), false)}
          disabled={!organization}
        >
          <Plus className="size-4" aria-hidden />
          {t("newEntry")}
        </Button>
      </div>

      <ProductionCalendar
        items={items}
        loading={loading}
        // A broken task or event listener would silently drop its markers from
        // the grid, which reads as "nothing is due" rather than "we could not
        // load this" — the exact confusion gotcha #4 exists to prevent. Any of
        // the three failing makes the whole calendar untrustworthy, so all
        // three are surfaced.
        failed={failed || tasksFailed || eventsFailed}
        onOpen={openItem}
        onCreateAt={openNew}
      />

      {organization ? (
        <CalendarDialog
          key={`${editing?.id ?? "new"}-${session}`}
          entry={editing}
          initialStart={seed.start}
          initialAllDay={seed.allDay}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          organizationId={organization.id}
          eventOptions={eventOptions}
        />
      ) : null}
    </div>
  );
}
