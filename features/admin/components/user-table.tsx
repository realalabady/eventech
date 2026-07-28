"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { restoreUser, suspendUser } from "../services/admin-service";
import {
  canSuspend,
  compareUsers,
  isSuspended,
  type AdminUser,
} from "../types";

/**
 * The platform user list (guide 43's User Management).
 *
 * Desktop-first per canonical §11, but the table becomes stacked cards on small
 * screens rather than scrolling sideways — nothing is removed, only
 * reorganized.
 */
export function UserTable({
  users,
  loading,
  failed,
  currentUserId,
}: {
  users: AdminUser[];
  loading: boolean;
  failed: boolean;
  currentUserId: string | null;
}) {
  const t = useTranslations("admin");
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    const matched = needle
      ? users.filter(
          (user) =>
            user.email.toLowerCase().includes(needle) ||
            (user.displayName ?? "").toLowerCase().includes(needle),
        )
      : users;
    return [...matched].sort(compareUsers);
  }, [users, filter]);

  async function onToggle(user: AdminUser) {
    setBusy(user.id);
    setError(null);
    const result = isSuspended(user)
      ? await restoreUser(user.id)
      : await suspendUser(user.id, null);
    setBusy(null);
    if (!result.ok) setError(result.errorKey);
  }

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
        {t("users.failed")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        aria-label={t("users.filterLabel")}
        placeholder={t("users.filterPlaceholder")}
        className="max-w-sm"
      />

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t(`errors.${error}`)}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <p className="rounded-xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          {t("users.empty")}
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {visible.map((user) => (
            <li
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {user.displayName || user.email}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="outline">{t(`role.${user.role}`)}</Badge>
                {isSuspended(user) ? (
                  <Badge variant="destructive">{t("users.suspended")}</Badge>
                ) : null}

                {canSuspend(user, currentUserId ?? "") ? (
                  <Button
                    size="sm"
                    variant={isSuspended(user) ? "outline" : "ghost"}
                    disabled={busy === user.id}
                    onClick={() => onToggle(user)}
                  >
                    {isSuspended(user)
                      ? t("users.restore")
                      : t("users.suspend")}
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
