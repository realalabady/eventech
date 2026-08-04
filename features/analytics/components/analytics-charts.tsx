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
      <Panel
        title={t("chart.overTime")}
        summary={
          <DataTable
            caption={t("chart.overTime")}
            head={[t("chart.dayLabel"), t("chart.bookingsLabel")]}
            rows={metrics.daily.map((point) => [point.day, point.bookings])}
          />
        }
      >
        <BookingsOverTime
          data={metrics.daily}
          label={t("chart.bookingsLabel")}
        />
      </Panel>

      <Panel
        title={t("chart.byTier")}
        summary={
          metrics.tiers.length > 0 ? (
            <DataTable
              caption={t("chart.byTier")}
              head={[t("chart.tierLabel"), t("chart.soldLabel")]}
              rows={metrics.tiers.map((tier) => [tier.name, tier.sold])}
            />
          ) : undefined
        }
      >
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

/**
 * `summary` is the chart's accessible equivalent (TASK_07 chart rules: provide
 * accessible summaries, never rely on colour alone). Recharts emits bare SVG
 * that a screen reader reads as a pile of unlabelled paths, so the figures are
 * repeated as a real table — visually hidden, fully navigable, and always in
 * sync because it is fed from the same data the chart draws.
 */
function Panel({
  title,
  summary,
  children,
}: {
  title: string;
  summary?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-xs">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      {/* aria-hidden on the visual chart: the table below is the accessible
          representation, and announcing both would duplicate every figure. */}
      <div aria-hidden="true">{children}</div>
      {summary ? <div className="sr-only">{summary}</div> : null}
    </section>
  );
}

function DataTable({
  caption,
  head,
  rows,
}: {
  caption: string;
  head: [string, string];
  rows: Array<[string, number]>;
}) {
  return (
    <table>
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{head[0]}</th>
          <th scope="col">{head[1]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <th scope="row">{label}</th>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
