"use client";

import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";

import { Skeleton } from "@/components/ui/skeleton";

import type { CalendarItem } from "../types";

/**
 * FullCalendar is heavy — it and its Temporal polyfill are worth more than the
 * whole initial bundle allowance on their own. Loading it on demand keeps the
 * workspace inside canonical §11's 250KB budget, and the skeleton stands in
 * meanwhile (§9: never a fullscreen spinner).
 */
const CalendarSurface = dynamic(
  () => import("./calendar-surface").then((module) => module.CalendarSurface),
  { ssr: false, loading: () => <Skeleton className="h-[36rem] w-full" /> },
);

/**
 * Swatches mirror `calendar-theme.css`, but as token utilities rather than the
 * `--fc-event-color` variables — that stylesheet ships with the deferred
 * calendar chunk, and the legend renders before it arrives.
 */
const LEGEND = [
  { key: "meeting", swatch: "bg-primary" },
  { key: "setup", swatch: "bg-brand" },
  { key: "deadline", swatch: "bg-warning" },
  { key: "task", swatch: "bg-muted-foreground" },
  { key: "event", swatch: "bg-success" },
] as const;

export function ProductionCalendar({
  items,
  loading,
  failed,
  onOpen,
  onCreateAt,
}: {
  items: CalendarItem[];
  loading: boolean;
  failed: boolean;
  onOpen: (item: CalendarItem) => void;
  onCreateAt: (startMillis: number, allDay: boolean) => void;
}) {
  const t = useTranslations("calendar");
  const locale = useLocale();

  if (loading) {
    return <Skeleton className="h-[36rem] w-full" />;
  }

  if (failed) {
    return (
      <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {t("failed")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {LEGEND.map(({ key, swatch }) => (
          <li
            key={key}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <span aria-hidden className={`size-2 rounded-full ${swatch}`} />
            {t(`legend.${key}`)}
          </li>
        ))}
      </ul>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <CalendarSurface
          items={items}
          rtl={locale === "ar"}
          hints={{
            prev: t("hints.prev"),
            next: t("hints.next"),
            view: t("hints.view"),
          }}
          onOpen={onOpen}
          onCreateAt={onCreateAt}
        />
      </div>
    </div>
  );
}
