"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { ACCOUNT_ROLES, type AccountRole } from "@/types/domain";

import { ADMIN_USER_CAP } from "../hooks/use-admin-users";
import {
  assignUserRole,
  restoreUser,
  suspendUser,
} from "../services/admin-service";
import {
  canSuspend,
  compareUsers,
  isSuspended,
  type AdminUser,
} from "../types";

import { SuspendUserDialog } from "./suspend-user-dialog";

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
  const [suspending, setSuspending] = useState<AdminUser | null>(null);
  // Bumped per open so the reason field remounts empty rather than carrying
  // the previous account's text over (gotcha #9).
  const [session, setSession] = useState(0);

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
    if (!isSuspended(user)) {
      setSuspending(user);
      setSession((count) => count + 1);
      return;
    }
    setBusy(user.id);
    setError(null);
    const result = await restoreUser(user.id);
    setBusy(null);
    if (!result.ok) setError(result.errorKey);
  }

  async function onConfirmSuspend(reason: string | null) {
    const user = suspending;
    if (!user) return;
    setBusy(user.id);
    setError(null);
    const result = await suspendUser(user.id, reason);
    setBusy(null);
    setSuspending(null);
    if (!result.ok) setError(result.errorKey);
  }

  async function onRoleChange(user: AdminUser, role: AccountRole) {
    if (role === user.role) return;
    setBusy(user.id);
    setError(null);
    const result = await assignUserRole(user.id, role);
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

      {users.length >= ADMIN_USER_CAP ? (
        <p className="rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          {t("users.capped", { count: ADMIN_USER_CAP })}
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
                {isSuspended(user) && user.suspendedReason ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("users.reasonShown", { reason: user.suspendedReason })}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {user.id === currentUserId ? (
                  // Demoting yourself drops your own admin claim and locks you
                  // out of the console you are standing in.
                  <Badge variant="outline" title={t("users.roleSelf")}>
                    {t(`role.${user.role}`)}
                  </Badge>
                ) : (
                  <Select
                    items={ACCOUNT_ROLES.map((role) => ({
                      value: role,
                      label: t(`role.${role}`),
                    }))}
                    value={user.role}
                    disabled={busy === user.id}
                    onValueChange={(role) => {
                      if (role) onRoleChange(user, role as AccountRole);
                    }}
                  >
                    <SelectTrigger
                      size="sm"
                      aria-label={t("users.roleLabel")}
                      className="w-36"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {t(`role.${role}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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

      <SuspendUserDialog
        key={`${suspending?.id ?? "none"}-${session}`}
        open={suspending !== null}
        onOpenChange={(next) => {
          if (!next) setSuspending(null);
        }}
        onConfirm={onConfirmSuspend}
        busy={busy !== null}
      />
    </div>
  );
}
