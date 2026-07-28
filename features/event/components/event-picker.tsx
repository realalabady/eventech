"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { useEvents } from "../hooks/use-events";

/**
 * Chooses which event a production view is showing.
 *
 * Lives in the event feature so the task, timeline and activity features never
 * have to reach across to it — pages compose the three together instead
 * (canonical §11: features never import each other).
 */
export function EventPicker({
  organizationId,
  selectedId,
  onSelect,
}: {
  organizationId: string | undefined;
  selectedId: string | null;
  onSelect: (eventId: string) => void;
}) {
  const t = useTranslations("event");
  const { events, loading } = useEvents(organizationId);

  // Land on something useful rather than an empty view.
  useEffect(() => {
    if (!selectedId && events.length > 0) {
      onSelect(events[0].id);
    }
  }, [selectedId, events, onSelect]);

  if (loading) {
    return <Skeleton className="h-9 w-64" />;
  }

  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("list.empty")}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {events.map((event) => {
        const active = event.id === selectedId;
        return (
          <button
            key={event.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(event.id)}
            className={`max-w-64 truncate rounded-full border px-4 py-1.5 text-sm transition-colors duration-150 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {event.title || t("list.untitled")}
          </button>
        );
      })}
    </div>
  );
}
