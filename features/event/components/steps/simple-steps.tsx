"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useOrganization } from "@/features/organization/hooks/use-organization";
import { Link } from "@/i18n/navigation";

import type { StepProps } from "../event-wizard";
import { isFreeEvent } from "../../types";

/** Accent colour used on the public event page. */
export function BrandingStep({ event, save, onDone }: StepProps) {
  const t = useTranslations("event");
  const [color, setColor] = useState(event.branding?.primary ?? "#3b82f6");

  async function onContinue() {
    if (await save({ branding: { primary: color } })) {
      onDone();
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-medium tracking-tight">
          {t("branding.heading")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("branding.hint")}</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="event-color">{t("branding.colorLabel")}</Label>
        <div className="flex items-center gap-3">
          <input
            id="event-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-11 w-16 cursor-pointer rounded-md border border-border bg-transparent p-1"
          />
          <span className="font-mono text-sm text-muted-foreground">
            {color}
          </span>
        </div>
      </div>

      <Button type="button" onClick={onContinue}>
        {t("wizard.next")}
      </Button>
    </div>
  );
}

/**
 * Timeline and starter tasks are seeded by createEvent; assigning them belongs
 * to the production tools phase, so this step explains rather than pretends.
 */
export function TeamStep({ onDone }: StepProps) {
  const t = useTranslations("event");

  return (
    <div className="max-w-lg space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-medium tracking-tight">
          {t("team.heading")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("team.hint")}</p>
      </div>
      <Button type="button" onClick={onDone}>
        {t("wizard.next")}
      </Button>
    </div>
  );
}

/**
 * Surfaces the bank-details gate before the organizer reaches Review, so a
 * paid event never fails at the last step with no explanation.
 */
export function PaymentStep({ event, onDone }: StepProps) {
  const t = useTranslations("event");
  const { organization } = useOrganization();

  const free = isFreeEvent(event.ticketTypes ?? []);
  const hasBankDetails = Boolean(organization?.payment?.iban);

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-lg font-medium tracking-tight">
        {t("payment.heading")}
      </h2>

      {free ? (
        <p className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
          {t("payment.free")}
        </p>
      ) : hasBankDetails ? (
        <p className="rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {t("payment.ready")}
        </p>
      ) : (
        <div className="space-y-4">
          <p className="rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            {t("payment.missing")}
          </p>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/workspace/settings" />}
          >
            {t("payment.goToSettings")}
          </Button>
        </div>
      )}

      <Button type="button" onClick={onDone}>
        {t("wizard.next")}
      </Button>
    </div>
  );
}
