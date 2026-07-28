"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPublicDate } from "@/features/discovery/lib/format";

import { compareReports, type ReportDoc } from "../moderation-types";
import { resolveReport, type AdminResult } from "../services/admin-service";

/**
 * The moderation queue (guide 43's report workflow: open → resolved).
 *
 * Resolving is recorded rather than deleting: `resolvedBy` and the resolution
 * both persist and the action is audited, so a decision to dismiss a report is
 * as accountable as a decision to act on one.
 */
export function ReportQueue({
  reports,
  loading,
  failed,
}: {
  reports: ReportDoc[];
  loading: boolean;
  failed: boolean;
}) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ordered = useMemo(() => [...reports].sort(compareReports), [reports]);

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
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (failed) {
    return (
      <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {t("reports.failed")}
      </p>
    );
  }

  if (ordered.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
        {t("reports.empty")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t(`errors.${error}`)}
        </p>
      ) : null}

      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {ordered.map((report) => (
          <li key={report.id} className="space-y-2 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  {t(`reports.category.${report.category}`)}
                </Badge>
                <Badge
                  variant={
                    report.status === "open" ? "destructive" : "secondary"
                  }
                >
                  {t(`reports.status.${report.status}`)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {t(`reports.target.${report.targetType}`)}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {report.targetId}
                </span>
              </div>

              <span className="text-xs text-muted-foreground tabular-nums">
                {formatPublicDate(
                  report.createdAt?.toMillis() ?? null,
                  null,
                  locale,
                  "d MMM, HH:mm",
                )}
              </span>
            </div>

            {report.detail ? (
              <p className="text-sm text-foreground/90">{report.detail}</p>
            ) : null}

            {report.status === "open" ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy === report.id}
                  onClick={() =>
                    run(report.id, () =>
                      resolveReport(report.id, "dismissed", null),
                    )
                  }
                >
                  {t("reports.dismiss")}
                </Button>
                <Button
                  size="sm"
                  disabled={busy === report.id}
                  onClick={() =>
                    run(report.id, () =>
                      resolveReport(report.id, "actioned", null),
                    )
                  }
                >
                  {t("reports.action")}
                </Button>
              </div>
            ) : report.resolution ? (
              <p className="text-xs text-muted-foreground">
                {t(`reports.resolution.${report.resolution}`)}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
