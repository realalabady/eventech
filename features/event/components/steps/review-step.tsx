"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { AuthError } from "@/features/auth/components/auth-error";

import type { StepProps } from "../event-wizard";
import { publishEvent } from "../../services/event-service";
import { formatEventDate, isFreeEvent, totalCapacity } from "../../types";

export function ReviewStep({ event }: StepProps) {
  const t = useTranslations("event");
  const [error, setError] = useState<string | undefined>();
  const [missing, setMissing] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onPublish() {
    setBusy(true);
    setError(undefined);
    setMissing([]);
    const result = await publishEvent(event.id);
    setBusy(false);

    if (!result.ok) {
      setError(result.errorKey);
      setMissing(result.missing ?? []);
      return;
    }
    setPublished(true);
  }

  const summary: Array<[string, string]> = [
    ["title", event.title ?? "—"],
    ["category", event.category ? t(`categories.${event.category}`) : "—"],
    ["startDate", formatEventDate(event.startDate, event.timezone) ?? "—"],
    ["ticketTypes", String((event.ticketTypes ?? []).length)],
  ];

  if (published) {
    return (
      <p className="max-w-lg rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
        {t("review.published")}
      </p>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-medium tracking-tight">
          {t("review.heading")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("review.hint")}</p>
      </div>

      <AuthError message={error ? t(`errors.${error}`) : undefined} />

      {missing.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {t("review.incomplete")}
          </p>
          <ul className="list-inside list-disc space-y-1">
            {missing.map((field) => (
              <li key={field} className="text-sm text-destructive">
                {t(`fields.${field}`)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <dl className="divide-y divide-border rounded-xl border border-border bg-card">
        {summary.map(([key, value]) => (
          <div key={key} className="flex justify-between gap-4 px-5 py-3">
            <dt className="text-sm text-muted-foreground">
              {t(`fields.${key}`)}
            </dt>
            <dd className="truncate text-sm">{value}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 px-5 py-3">
          <dt className="text-sm text-muted-foreground">
            {t("tickets.capacity", {
              count: totalCapacity(event.ticketTypes ?? []),
            })}
          </dt>
          <dd className="text-sm">
            {isFreeEvent(event.ticketTypes ?? []) ? t("tickets.free") : ""}
          </dd>
        </div>
      </dl>

      <Button type="button" disabled={busy} onClick={onPublish}>
        {t("review.publish")}
      </Button>
    </div>
  );
}
