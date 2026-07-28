"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { ActivityFeed } from "@/features/activity/components/activity-feed";
import { EventPicker } from "@/features/event/components/event-picker";
import { useOrganization } from "@/features/organization/hooks/use-organization";
import { EventTimeline } from "@/features/timeline/components/event-timeline";

/**
 * Timeline and activity side by side: what is left to do, and what has already
 * happened. Guide 41 treats these as separate dashboard sections, but they
 * answer the same question about one event, so they share a page.
 */
export function ProductionPanel() {
  const t = useTranslations("activity");
  const { organization } = useOrganization();
  const [eventId, setEventId] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <EventPicker
        organizationId={organization?.id}
        selectedId={eventId}
        onSelect={setEventId}
      />

      {eventId ? (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
          <EventTimeline eventId={eventId} organizationId={organization?.id} />

          <section className="space-y-3">
            <h2 className="text-lg font-medium tracking-tight">{t("title")}</h2>
            <ActivityFeed eventId={eventId} organizationId={organization?.id} />
          </section>
        </div>
      ) : null}
    </div>
  );
}
