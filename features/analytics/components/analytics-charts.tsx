"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

import { Skeleton } from "@/components/ui/skeleton";

import type { EventMetrics } from "../types";

/**
 * Recharts is lazy-loaded (canonical §11 names it specifically), so the chart
 * library only arrives for the one page that draws charts. A skeleton stands in
 * meanwhile — §9 forbids fullscreen spinners.
 */
const chartSkeleton = () => <Skeleton className="h-[16.25rem] w-full" />;

const BookingsOverTime = dynamic(
  () => import("./charts-surface").then((module) => module.BookingsOverTime),
  { ssr: false, loading: chartSkeleton },
);

const SalesByTier = dynamic(
  () => import("./charts-surface").then((module) => module.SalesByTier),
  { ssr: false, loading: chartSkeleton },
);

export function AnalyticsCharts({
  metrics,
  loading,
}: {
  metrics: EventMetrics;
  loading: boolean;
}) {
  const t = useTranslations("analytics");

  if (loading) {
    return (
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Panel title={t("chart.overTime")}>
        <BookingsOverTime
          data={metrics.daily}
          label={t("chart.bookingsLabel")}
        />
      </Panel>

      <Panel title={t("chart.byTier")}>
        {metrics.tiers.length > 0 ? (
          <SalesByTier data={metrics.tiers} soldLabel={t("chart.soldLabel")} />
        ) : (
          <p className="py-20 text-center text-sm text-muted-foreground">
            {t("chart.noTiers")}
          </p>
        )}
      </Panel>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-6">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}
