"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPublicDate } from "@/features/discovery/lib/format";

import { listAuditLogs } from "../services/admin-service";
import { isKnownAuditAction, type AuditEntry } from "../types";

const PAGE = 50;

/**
 * The audit trail (guide 43).
 *
 * Fetched through a callable rather than a listener because `auditLogs` is
 * never client-readable (canonical §7). Paged by a `createdAt` cursor, so rows
 * cannot shift between pages while an admin is reading.
 *
 * Unknown actions fall back to a generic sentence rather than rendering a raw
 * key — future phases will write actions this build has no wording for.
 */
export function AuditLog() {
  const t = useTranslations("admin");
  const locale = useLocale();

  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const [busy, setBusy] = useState(false);
  const [exhausted, setExhausted] = useState(false);

  // State is set inside the async function rather than in a `.then` chained in
  // the effect body — `react-hooks/set-state-in-effect` is a hard error here
  // (gotcha #9), and only lint catches it.
  useEffect(() => {
    let cancelled = false;

    async function loadFirstPage() {
      const result = await listAuditLogs(null, PAGE);
      if (cancelled) return;
      if (!result.ok) {
        setState("failed");
        return;
      }
      const page = result.data?.entries ?? [];
      setEntries(page);
      setExhausted(page.length < PAGE);
      setState("ready");
    }

    void loadFirstPage();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onMore() {
    const oldest = entries[entries.length - 1]?.createdAt ?? null;
    setBusy(true);
    const result = await listAuditLogs(oldest, PAGE);
    setBusy(false);
    if (!result.ok) return;

    const page = result.data?.entries ?? [];
    setEntries((current) => [...current, ...page]);
    setExhausted(page.length < PAGE);
  }

  if (state === "loading") {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (state === "failed") {
    return (
      <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {t("audit.failed")}
      </p>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
        {t("audit.empty")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ol className="divide-y divide-border rounded-xl border border-border bg-card">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-3"
          >
            <span className="text-sm">
              {isKnownAuditAction(entry.action)
                ? t(`audit.action.${entry.action}`)
                : t("audit.action.unknown")}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {entry.resourceId}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatPublicDate(entry.createdAt, null, locale, "d MMM, HH:mm")}
            </span>
          </li>
        ))}
      </ol>

      {exhausted ? null : (
        <Button variant="outline" size="sm" onClick={onMore} disabled={busy}>
          {t("audit.more")}
        </Button>
      )}
    </div>
  );
}
