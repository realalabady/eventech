"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthError } from "@/features/auth/components/auth-error";
import { useOrganization } from "@/features/organization/hooks/use-organization";
import { Link } from "@/i18n/navigation";

import type { StepProps } from "../event-wizard";
import { uploadEventCover } from "../../services/event-service";
import { isFreeEvent } from "../../types";

/** Cover image and accent colour, both used on the public event page. */
export function BrandingStep({ event, save, onDone }: StepProps) {
  const t = useTranslations("event");
  const [color, setColor] = useState(event.branding?.primary ?? "#3b82f6");
  const [cover, setCover] = useState<string | null>(event.coverImage ?? null);
  const [error, setError] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onPickCover(changeEvent: React.ChangeEvent<HTMLInputElement>) {
    const file = changeEvent.target.files?.[0];
    if (!file) return;
    setError(undefined);
    setUploading(true);
    const result = await uploadEventCover(event.id, file);
    setUploading(false);
    if (!result.ok) {
      setError(result.errorKey);
      return;
    }
    setCover(result.data?.url ?? null);
  }

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

      <AuthError message={error ? t(`errors.${error}`) : undefined} />

      <div className="grid gap-2">
        <Label htmlFor="event-cover">{t("branding.coverLabel")}</Label>
        <div className="relative aspect-[16/9] overflow-hidden rounded-md border border-border bg-surface">
          {cover ? (
            <Image
              src={cover}
              alt={event.title ?? ""}
              fill
              unoptimized
              sizes="32rem"
              className="object-cover"
            />
          ) : null}
        </div>
        <input
          ref={inputRef}
          id="event-cover"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onPickCover}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {t("branding.upload")}
        </Button>
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
