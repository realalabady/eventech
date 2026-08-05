"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { EmptyState } from "@/components/feedback/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { AuthError } from "@/features/auth/components/auth-error";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Link, useRouter } from "@/i18n/navigation";

import { useEvents } from "../hooks/use-events";
import { createEvent } from "../services/event-service";
import { formatEventDate } from "../types";

export function EventList() {
  const t = useTranslations("event");
  const { claims } = useAuth();
  const organizationId = claims?.organizationId;
  const { events, loading, failed } = useEvents(organizationId);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function onCreate() {
    if (!organizationId) return;
    setBusy(true);
    setError(undefined);
    const result = await createEvent(organizationId);
    setBusy(false);
    if (!result.ok) {
      setError(result.errorKey);
      return;
    }
    router.push(`/workspace/events/${result.data?.eventId}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("list.title")}
          </h1>
          <p className="text-muted-foreground">{t("list.subtitle")}</p>
        </div>
        <Button disabled={busy} onClick={onCreate}>
          {t("list.create")}
        </Button>
      </div>

      <AuthError message={error ? t(`errors.${error}`) : undefined} />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : failed ? (
        // An empty list and a broken query look identical to the user unless
        // we say which one happened.
        <div className="space-y-2 rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-10 text-center">
          <p className="font-medium text-destructive">{t("list.loadFailed")}</p>
          <p className="text-sm text-muted-foreground">
            {t("list.loadFailedHint")}
          </p>
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          illustration="calendar"
          title={t("list.empty")}
          description={t("list.emptyHint")}
        />
      ) : (
        <Stagger className="space-y-3">
          {events.map((event) => (
            <StaggerItem key={event.id}>
              <Link
                href={`/workspace/events/${event.id}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-[transform,border-color] duration-[var(--motion-fast)] ease-out hover:-translate-y-0.5 hover:border-foreground/20"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate font-medium">
                    {event.title ?? t("list.untitled")}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {formatEventDate(event.startDate, event.timezone) ??
                      t("list.noDate")}
                  </p>
                </div>
                <Badge
                  variant={
                    event.status === "published" ? "default" : "secondary"
                  }
                >
                  {t(`status.${event.status}`)}
                </Badge>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
