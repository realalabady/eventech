"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** `suspendUser` truncates past this, so the field stops where the server does. */
const MAX_REASON = 280;

/**
 * Confirms a suspension and captures the reason that goes with it.
 *
 * `suspendUser` has always stored a `reason` — nothing ever collected one, so
 * every suspension landed in the audit log unexplained. Suspension also ends
 * the person's sessions, which is worth a confirmation step rather than a bare
 * click on a row.
 *
 * Like the calendar dialog, the form seeds at mount and never syncs after; the
 * caller remounts it per open rather than resetting through an effect.
 */
export function SuspendUserDialog({
  open,
  onOpenChange,
  onConfirm,
  busy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string | null) => void;
  busy: boolean;
}) {
  const t = useTranslations("admin.users");
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("suspendTitle")}</DialogTitle>
          <DialogDescription>{t("suspendHint")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="suspend-reason">{t("reasonLabel")}</Label>
          <Textarea
            id="suspend-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={MAX_REASON}
            rows={3}
            placeholder={t("reasonPlaceholder")}
          />
          <p className="text-xs text-muted-foreground">{t("reasonHint")}</p>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={busy}
            onClick={() => onConfirm(reason.trim() || null)}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
