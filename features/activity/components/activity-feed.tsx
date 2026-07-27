"use client";

import { useLocale, useTranslations } from "next-intl";

import { Skeleton } from "@/components/ui/skeleton";
import { formatPublicDate } from "@/features/discovery/lib/format";

import { useEventActivity } from "../hooks/use-activity";
import { isKnownAction } from "../types";

/**
 * What has happened on this event, newest first (guide 41's Activity Center).
 *
 * Actions written by future phases have no translated sentence yet, so they
 * fall back to a generic line rather than rendering a raw key — an unknown
 * action degrades quietly instead of leaking internals into the UI.
 */
export function ActivityFeed({ eventId }: { eventId: string }) {
  const t = useTranslations("activity");
  const locale = useLocale();
  const { activity, loading, failed } = useEventActivity(eventId);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (failed) {
    return (
      <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {t("failed")}
      </p>
    );
  }

  if (activity.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
        {t("empty")}
      </p>
    );
  }

  return (
    <ol className="space-y-1">
      {activity.map((entry) => {
        const when = formatPublicDate(
          entry.createdAt?.toMillis() ?? null,
          null,
          locale,
          "d MMM, HH:mm",
        );
        return (
          <li
            key={entry.id}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border/60 px-1 py-3 last:border-b-0"
          >
            <span className="text-sm">
              {isKnownAction(entry.action)
                ? t(`action.${entry.action}`)
                : t("action.unknown")}
            </span>
            {when ? (
              <span className="text-xs text-muted-foreground tabular-nums">
                {when}
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
