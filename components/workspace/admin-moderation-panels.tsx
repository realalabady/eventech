"use client";

import { EventModeration } from "@/features/admin/components/event-moderation";
import { OrganizationTable } from "@/features/admin/components/organization-table";
import { PlatformSettings } from "@/features/admin/components/platform-settings";
import { ReportQueue } from "@/features/admin/components/report-queue";
import {
  useAdminEvents,
  useAdminOrganizations,
  useFeatureFlags,
  useReports,
  useSystemSettings,
} from "@/features/admin/hooks/use-moderation";

/**
 * Composition layer for the Phase 9b/9c admin surfaces. Each panel is a thin
 * wrapper so the feature components stay presentational and testable, matching
 * how the workspace panels are put together.
 */

export function AdminOrganizationsPanel() {
  const { organizations, loading, failed } = useAdminOrganizations();
  return (
    <OrganizationTable
      organizations={organizations}
      loading={loading}
      failed={failed}
    />
  );
}

export function AdminEventsPanel() {
  const { events, loading, failed } = useAdminEvents();
  return <EventModeration events={events} loading={loading} failed={failed} />;
}

export function AdminReportsPanel() {
  const { reports, loading, failed } = useReports();
  return <ReportQueue reports={reports} loading={loading} failed={failed} />;
}

export function AdminPlatformPanel() {
  const flagState = useFeatureFlags();
  const settingsState = useSystemSettings();

  // The settings form seeds itself from `settings` at mount, so it must not
  // render until that document has actually arrived — otherwise the inputs
  // latch onto empty strings and an admin saves blanks over real values.
  if (flagState.loading || settingsState.loading) {
    return (
      <PlatformSettings flags={null} settings={null} loading failed={false} />
    );
  }

  return (
    <PlatformSettings
      flags={flagState.flags}
      settings={settingsState.settings}
      loading={false}
      failed={flagState.failed || settingsState.failed}
    />
  );
}
