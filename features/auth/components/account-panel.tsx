"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";

import { useAuth } from "../hooks/use-auth";
import { signOut } from "../services/auth-service";

export function AccountPanel() {
  const t = useTranslations("auth");
  const { user, claims } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleSignOut() {
    setBusy(true);
    await signOut();
    router.replace("/login");
  }

  const verified = user?.emailVerified ?? false;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="text-2xl font-semibold tracking-tight">
          {user?.displayName ?? user?.email}
        </p>
        <p className="text-muted-foreground">{user?.email}</p>
      </div>

      <dl className="divide-y divide-border rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-4">
          <dt className="text-sm text-muted-foreground">{t("account.role")}</dt>
          <dd>
            <Badge variant="secondary">
              {t(`roles.${claims?.role ?? "attendee"}`)}
            </Badge>
          </dd>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <dt className="text-sm text-muted-foreground">
            {t("account.emailStatus")}
          </dt>
          <dd className="flex items-center gap-3">
            <span
              className={
                verified ? "text-sm text-success" : "text-sm text-warning"
              }
            >
              {verified ? t("account.confirmed") : t("account.unconfirmed")}
            </span>
            {verified ? null : (
              <Button
                size="xs"
                variant="outline"
                nativeButton={false}
                render={<Link href="/verify-email" />}
              >
                {t("verify.resend")}
              </Button>
            )}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          nativeButton={false}
          render={
            <Link
              href={
                claims?.organizationId ? "/workspace/team" : "/organizer/new"
              }
            />
          }
        >
          {claims?.organizationId
            ? t("account.openWorkspace")
            : t("account.becomeOrganizer")}
        </Button>
        <Button variant="outline" disabled={busy} onClick={handleSignOut}>
          {t("account.signOut")}
        </Button>
      </div>
    </div>
  );
}
