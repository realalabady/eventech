"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { AnalyticsCharts } from "@/features/analytics/components/analytics-charts";
import { MetricTiles } from "@/features/analytics/components/metric-tiles";
import { useEventMetrics } from "@/features/analytics/hooks/use-analytics";
import { EventPicker } from "@/features/event/components/event-picker";
import { useOrganization } from "@/features/organization/hooks/use-organization";

/**
 * Composition layer for the analytics dashboard.
 *
 * Scoped to one event rather than the whole organization, because every figure
 * guide 41 asks for — views, bookings, attendance, conversion — is only
 * meaningful per event. Uses the same `EventPicker` as the other production
 * views so the workspace scopes itself the same way everywhere.
 */
export function AnalyticsPanel() {
  const t = useTranslations("analytics");
  const { organization } = useOrganization();
  const [eventId, setEventId] = useState<string | null>(null);
  const { metrics, loading, failed } = useEventMetrics(
    eventId ?? undefined,
    organization?.id,
  );

  return (
    <div className="space-y-8">
      <EventPicker
        organizationId={organization?.id}
        selectedId={eventId}
        onSelect={setEventId}
      />

      {failed ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t("failed")}
        </p>
      ) : eventId ? (
        <>
          <MetricTiles metrics={metrics} loading={loading} />
          <AnalyticsCharts metrics={metrics} loading={loading} />
        </>
      ) : null}
    </div>
  );
}
