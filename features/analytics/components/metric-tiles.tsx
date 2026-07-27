"use client";

import { Eye, Ticket, TrendingUp, UserCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";

import { AnimatedCounter } from "@/components/motion/animated-counter";
import { Skeleton } from "@/components/ui/skeleton";

import { attendanceRate, conversionRate, type EventMetrics } from "../types";

/**
 * Guide 41's live metric cards. Counters count up **once** (canonical §9) —
 * `AnimatedCounter` drives a motion value rather than React state, so the
 * per-frame updates never re-render the tile.
 */
export function MetricTiles({
  metrics,
  loading,
}: {
  metrics: EventMetrics;
  loading: boolean;
}) {
  const t = useTranslations("analytics");

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  const conversion = conversionRate(metrics);
  const attendance = attendanceRate(metrics);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Tile
        icon={Eye}
        label={t("metric.views")}
        value={metrics.views}
        hint={t("metric.viewsHint")}
      />
      <Tile
        icon={Ticket}
        label={t("metric.bookings")}
        value={metrics.bookings}
        hint={t("metric.bookingsHint", { approved: metrics.approved })}
      />
      <Tile
        icon={UserCheck}
        label={t("metric.attended")}
        value={metrics.attended}
        hint={
          attendance === null
            ? t("metric.noTickets")
            : t("metric.attendedHint", { percent: attendance })
        }
      />
      <Tile
        icon={TrendingUp}
        label={t("metric.conversion")}
        // A page nobody has opened has not converted badly — it is unmeasured.
        value={conversion}
        suffix="%"
        hint={
          conversion === null ? t("metric.noViews") : t("metric.conversionHint")
        }
      />
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  suffix,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: number | null;
  suffix?: string;
  hint: string;
}) {
  const t = useTranslations("analytics");

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-6 transition-colors duration-150 hover:border-border/80">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" aria-hidden />
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-3xl font-semibold tabular-nums">
        {value === null ? (
          <span className="text-muted-foreground">
            {t("metric.unmeasured")}
          </span>
        ) : (
          <>
            <AnimatedCounter value={value} />
            {suffix}
          </>
        )}
      </p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
