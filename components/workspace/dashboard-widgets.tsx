"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Widget, type WidgetLabels, type WidgetState } from "@/components/workspace/widget";
import type { EventDoc } from "@/features/event/types";
import type { TaskDoc } from "@/features/task/types";
import { TASK_COLUMNS } from "@/features/task/types";

/** Builds the shared, translated label set once per consumer. */
export function useWidgetLabels(): WidgetLabels {
  const t = useTranslations("organization.dashboard.widget");
  const tCommon = useTranslations("common");
  return {
    refresh: t("refresh"),
    collapse: t("collapse"),
    expand: t("expand"),
    open: t("open"),
    errorTitle: t("errorTitle"),
    errorDescription: t("errorDescription"),
    emptyTitle: t("emptyTitle"),
    loading: tCommon("loading"),
  };
}

/**
 * Task progress across the organisation.
 *
 * Columns come from `TASK_COLUMNS` rather than a local list, so this cannot
 * drift from the canonical §4 statuses the kanban board uses.
 */
export function TaskProgressWidget({
  tasks,
  state,
  labels,
}: {
  tasks: TaskDoc[];
  state: WidgetState;
  labels: WidgetLabels;
}) {
  const t = useTranslations("organization.dashboard.widget");
  const tTask = useTranslations("task");

  const { done, total, byStatus } = useMemo(() => {
    const counts = new Map(TASK_COLUMNS.map((s) => [s, 0]));
    for (const task of tasks) {
      counts.set(task.status, (counts.get(task.status) ?? 0) + 1);
    }
    return {
      done: counts.get("done") ?? 0,
      total: tasks.length,
      byStatus: TASK_COLUMNS.map((s) => ({ status: s, count: counts.get(s) ?? 0 })),
    };
  }, [tasks]);

  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <Widget
      title={t("taskProgress")}
      subtitle={t("taskProgressHint")}
      state={total === 0 && state === "ready" ? "empty" : state}
      labels={labels}
      href="/workspace/tasks"
      collapsible
      skeleton={
        <div className="space-y-3">
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-h3" data-numeric>
            {t("taskDone", { done, total })}
          </p>
        </div>

        {/* Width, not scaleX: this bar has a text sibling and lives in flow, so
            a transform would leave the track and the fill visually detached. */}
        <div
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("taskProgress")}
          className="h-2 overflow-hidden rounded-full bg-border"
        >
          <div
            className="h-full rounded-full bg-success transition-[width] duration-[var(--motion-slow)] ease-out motion-reduce:transition-none"
            style={{ width: `${percent}%` }}
          />
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
          {byStatus.map(({ status, count }) => (
            <div key={status} className="space-y-0.5">
              <dt className="text-caption text-muted-foreground">
                {tTask(`status.${status}`)}
              </dt>
              <dd className="text-small font-medium" data-numeric>
                {count}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Widget>
  );
}

/**
 * Events ranked by tickets sold.
 *
 * The bar is a share of the leader rather than of capacity, so the ranking
 * stays readable when one event is far larger than the rest.
 */
export function TopEventsWidget({
  events,
  state,
  labels,
}: {
  events: EventDoc[];
  state: WidgetState;
  labels: WidgetLabels;
}) {
  const t = useTranslations("organization.dashboard.widget");

  const ranked = useMemo(
    () =>
      [...events]
        .filter((e) => e.soldTickets > 0)
        .sort((a, b) => b.soldTickets - a.soldTickets)
        .slice(0, 5),
    [events],
  );

  const leader = ranked[0]?.soldTickets ?? 0;

  return (
    <Widget
      title={t("topEvents")}
      subtitle={t("topEventsHint")}
      state={ranked.length === 0 && state === "ready" ? "empty" : state}
      labels={{ ...labels, emptyTitle: t("topEventsEmpty") }}
      href="/workspace/analytics"
      collapsible
      skeleton={
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      }
    >
      <ol className="space-y-3">
        {ranked.map((event) => (
          <li key={event.id} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-small font-medium">
                {event.title}
              </span>
              <span className="shrink-0 text-caption text-muted-foreground" data-numeric>
                {t("soldOf", {
                  sold: event.soldTickets,
                  capacity: event.capacity,
                })}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-[var(--motion-slow)] ease-out motion-reduce:transition-none"
                style={{
                  width: `${leader === 0 ? 0 : (event.soldTickets / leader) * 100}%`,
                }}
              />
            </div>
          </li>
        ))}
      </ol>
    </Widget>
  );
}
