"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  compareOrganizations,
  type AdminOrganization,
} from "../moderation-types";
import {
  suspendOrganization,
  verifyOrganizer,
  type AdminResult,
} from "../services/admin-service";

/**
 * Organizer verification and suspension (guide 43).
 *
 * Verification is a badge only — canonical §3 is explicit that unverified
 * organizers can still publish and sell — so the two controls are deliberately
 * separate: one grants trust, the other withdraws the ability to publish.
 */
export function OrganizationTable({
  organizations,
  loading,
  failed,
}: {
  organizations: AdminOrganization[];
  loading: boolean;
  failed: boolean;
}) {
  const t = useTranslations("admin");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ordered = useMemo(
    () => [...organizations].sort(compareOrganizations),
    [organizations],
  );

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
        {t("organizations.failed")}
      </p>
    );
  }

  if (ordered.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
        {t("organizations.empty")}
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
        {ordered.map((org) => (
          <li
            key={org.id}
            className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{org.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {org.slug}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {org.verified ? (
                <Badge variant="outline">{t("organizations.verified")}</Badge>
              ) : null}
              {org.suspended ? (
                <Badge variant="destructive">
                  {t("organizations.suspended")}
                </Badge>
              ) : null}

              <Button
                size="sm"
                variant="ghost"
                disabled={busy === org.id}
                onClick={() =>
                  run(org.id, () => verifyOrganizer(org.id, !org.verified))
                }
              >
                {org.verified
                  ? t("organizations.unverify")
                  : t("organizations.verify")}
              </Button>

              <Button
                size="sm"
                variant={org.suspended ? "outline" : "ghost"}
                disabled={busy === org.id}
                onClick={() =>
                  run(org.id, () =>
                    suspendOrganization(org.id, !org.suspended, null),
                  )
                }
              >
                {org.suspended
                  ? t("organizations.restore")
                  : t("organizations.suspend")}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
