"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { AuthError } from "@/features/auth/components/auth-error";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import type { Organization } from "../types";
import {
  uploadOrganizationImage,
  updateBranding,
} from "../services/organization-service";

function ImageUploader({
  kind,
  label,
  currentUrl,
  organizationId,
  onError,
  aspect,
}: {
  kind: "logo" | "cover";
  label: string;
  currentUrl: string | null;
  organizationId: string;
  onError: (key: string | undefined) => void;
  aspect: string;
}) {
  const t = useTranslations("organization");
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    onError(undefined);
    setBusy(true);
    const result = await uploadOrganizationImage(organizationId, kind, file);
    setBusy(false);

    if (!result.ok) {
      onError(result.errorKey);
      return;
    }
    setPreview(result.data?.url ?? null);
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className={`relative overflow-hidden rounded-md border border-border bg-surface ${aspect}`}
      >
        {preview ? (
          <Image
            src={preview}
            alt={label}
            fill
            className="object-cover"
            unoptimized
          />
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {t("settings.upload")}
      </Button>
    </div>
  );
}

export function BrandingSettings({
  organization,
}: {
  organization: Organization;
}) {
  const t = useTranslations("organization");
  const [error, setError] = useState<string | undefined>();
  const [color, setColor] = useState(
    organization.branding?.primary ?? "#3b82f6",
  );
  const [saved, setSaved] = useState(false);

  async function handleColorCommit(next: string) {
    setColor(next);
    setSaved(false);
    setError(undefined);
    const result = await updateBranding(organization.id, { primary: next });
    if (!result.ok) {
      setError(result.errorKey);
      return;
    }
    setSaved(true);
  }

  return (
    <div className="max-w-lg space-y-6">
      <AuthError message={error ? t(`errors.${error}`) : undefined} />

      <div className="grid gap-6 sm:grid-cols-2">
        <ImageUploader
          kind="logo"
          label={t("settings.logoLabel")}
          currentUrl={organization.branding?.logoUrl ?? null}
          organizationId={organization.id}
          onError={setError}
          aspect="aspect-square w-28"
        />
        <ImageUploader
          kind="cover"
          label={t("settings.coverLabel")}
          currentUrl={organization.branding?.coverUrl ?? null}
          organizationId={organization.id}
          onError={setError}
          aspect="aspect-[16/9]"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="branding-color">{t("settings.colorLabel")}</Label>
        <div className="flex items-center gap-3">
          <input
            id="branding-color"
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            onBlur={(event) => handleColorCommit(event.target.value)}
            className="h-11 w-16 cursor-pointer rounded-md border border-border bg-transparent p-1"
          />
          <span className="font-mono text-sm text-muted-foreground">
            {color}
          </span>
          {saved ? (
            <span className="text-sm text-success">{t("settings.saved")}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
