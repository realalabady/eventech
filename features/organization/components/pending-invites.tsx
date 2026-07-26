"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";

import { usePendingInvites } from "../hooks/use-members";
import { acceptInvitation } from "../services/organization-service";

/** Surfaces in-app invitations (canonical §7 — no email in MVP). */
export function PendingInvites() {
  const t = useTranslations("organization");
  const invites = usePendingInvites();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  if (invites.length === 0) {
    return null;
  }

  async function handleAccept(inviteId: string) {
    setBusyId(inviteId);
    const result = await acceptInvitation(inviteId);
    setBusyId(null);
    if (result.ok) {
      router.replace("/workspace/team");
      router.refresh();
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-6">
      <h2 className="text-lg font-medium">{t("invites.title")}</h2>
      <ul className="space-y-3">
        {invites.map((invite) => (
          <li
            key={invite.id}
            className="flex flex-wrap items-center justify-between gap-3"
          >
            <p className="text-sm text-muted-foreground">
              {t("invites.body", {
                organization: invite.organizationId,
                role: t(`roles.${invite.role}`),
              })}
            </p>
            <Button
              size="sm"
              disabled={busyId === invite.id}
              onClick={() => handleAccept(invite.id)}
            >
              {t("invites.accept")}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
