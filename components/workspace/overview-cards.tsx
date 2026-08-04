"use client";

import {
  CalendarDays,
  ClipboardList,
  Ticket,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { AnimatedCounter } from "@/components/motion/animated-counter";
import { WidgetSkeleton } from "@/components/ui/skeletons";
import { cn } from "@/lib/utils";

/**
 * Organisation-level KPI row.
 *
 * Everything here is derived from the realtime listeners the workspace already
 * runs (events, bookings, tasks) rather than new Firestore queries — the
 * dashboard costs no extra reads beyond what the feature pages were doing.
 *
 * `MetricTiles` in features/analytics is deliberately not reused: it is scoped
 * to one event and reports views/conversion/attendance, none of which are
 * meaningful summed across an organisation.
 */

export type OverviewMetric = {
  key: "events" | "bookings" | "revenue" | "pending" | "attendees" | "tasks";
  value: number;
  /** Day-buckets, oldest first. Drives the sparkline. */
  series: number[];
  /** Percent change against the preceding window. Null when there is no prior data. */
  trend: number | null;
  /** Rendered instead of the counter when the figure is money. */
  formatted?: string;
};

const ICONS: Record<OverviewMetric["key"], LucideIcon> = {
  events: CalendarDays,
  bookings: Ticket,
  revenue: Wallet,
  pending: ClipboardList,
  attendees: Users,
  tasks: ClipboardList,
};

/**
 * Sparkline as inline SVG rather than Recharts.
 *
 * Six of these render above the fold. Recharts would pull a charting runtime
 * into the dashboard's first load for six decorative 60×20 strips, and TASK_06
 * explicitly asks for charts to be lazy-loaded. A polyline costs nothing and
 * cannot shift layout.
 */
function Sparkline({ series }: { series: number[] }) {
  if (series.length < 2) return null;

  const max = Math.max(...series);
  const min = Math.min(...series);
  const span = max - min || 1;
  const step = 100 / (series.length - 1);

  const points = series
    .map((v, i) => `${(i * step).toFixed(2)},${(24 - ((v - min) / span) * 22).toFixed(2)}`)
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 24"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className="h-6 w-full text-brand/70"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Trend({ value }: { value: number | null }) {
  const t = useTranslations("organization.dashboard");
  const format = useFormatter();
  if (value === null || value === 0) return null;

  const up = value > 0;
  const Icon = up ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-caption",
        up ? "text-success" : "text-destructive",
      )}
    >
      <Icon aria-hidden="true" className="size-3" />
      {/* The arrow direction is decorative; the label carries the meaning for
          anyone who cannot see colour or icon. */}
      <span className="sr-only">{up ? t("trend.up") : t("trend.down")}</span>
      {/* Formatted rather than concatenated: the sign, the percent glyph and
          the numerals all differ by locale, and Arabic places them differently. */}
      <span data-numeric>
        {format.number(Math.round(value) / 100, {
          style: "percent",
          signDisplay: "exceptZero",
        })}
      </span>
    </span>
  );
}

function Card({ metric }: { metric: OverviewMetric }) {
  const t = useTranslations("organization.dashboard.metric");
  const Icon = ICONS[metric.key];

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-xs transition-[border-color,box-shadow,transform] duration-[var(--motion-fast)] ease-out hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md motion-reduce:hover:translate-y-0">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-caption text-muted-foreground">
          <Icon aria-hidden="true" className="size-3.5" />
          {t(metric.key)}
        </span>
        <Trend value={metric.trend} />
      </div>

      <p className="text-h2" data-numeric>
        {metric.formatted ?? <AnimatedCounter value={metric.value} />}
      </p>

      <Sparkline series={metric.series} />

      <p className="text-caption text-muted-foreground">{t(`${metric.key}Hint`)}</p>
    </div>
  );
}

export function OverviewCards({
  metrics,
  loading,
  label,
}: {
  metrics: OverviewMetric[];
  loading: boolean;
  /** Already-translated status text for the loading region. */
  label: string;
}) {
  if (loading) {
    return (
      <div role="status" aria-busy="true" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <span className="sr-only">{label}</span>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <WidgetSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.key} metric={metric} />
      ))}
    </div>
  );
}
