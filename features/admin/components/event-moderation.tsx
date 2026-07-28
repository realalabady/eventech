"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { canRestore, type AdminEvent } from "../moderation-types";
import { updateEventStatus, type AdminResult } from "../services/admin-service";

/**
 * Event moderation (guide 43).
 *
 * A takedown is a status change, never a delete: discovery and the public event
 * pages all query `status == "published"`, so moving an event off it removes it
 * from the site while the record, its bookings and its issued tickets survive
 * for the people already holding them.
 */
export function EventModeration({
  events,
  loading,
  failed,
}: {
  events: AdminEvent[];
  loading: boolean;
  failed: boolean;
}) {
  const t = useTranslations("admin");
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    const matched = needle
      ? events.filter((event) => event.title.toLowerCase().includes(needle))
      : events;
    // Published first: those are the ones actually in front of the public.
    return [...matched].sort((a, b) => {
      const byLive =
        Number(b.status === "published") - Number(a.status === "published");
      return byLive !== 0 ? byLive : a.title.localeCompare(b.title);
    });
  }, [events, filter]);

  async function run(id: string, action: () => Promise<AdminResult>) {
    setBusy(id);
    setError(null);
    const result = await action();
    setBusy(null);
    if (!result.ok) setError(result.errorKey);
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  if (failed) {
    return (
      <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {t("events.failed")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        aria-label={t("events.filterLabel")}
        placeholder={t("events.filterPlaceholder")}
        className="max-w-sm"
      />

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t(`errors.${error}`)}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <p className="rounded-xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          {t("events.empty")}
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {visible.map((event) => (
            <li
              key={event.id}
              className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{event.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {event.slug ?? event.id}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline">
                  {t(`eventStatus.${event.status}`)}
                </Badge>

                {event.status === "published" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy === event.id}
                    onClick={() =>
                      run(event.id, () =>
                        updateEventStatus(event.id, "cancelled", null),
                      )
                    }
                  >
                    {t("events.takeDown")}
                  </Button>
                ) : canRestore(event) ? (
                  // Only an event that was published once may be restored —
                  // otherwise a takedown could push a draft live on the way back.
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy === event.id}
                    onClick={() =>
                      run(event.id, () =>
                        updateEventStatus(event.id, "published", null),
                      )
                    }
                  >
                    {t("events.restore")}
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
