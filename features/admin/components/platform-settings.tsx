"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

import { isFlagEnabled } from "../moderation-types";
import {
  setFeatureFlag,
  updateSystemSettings,
} from "../services/admin-service";

/**
 * Feature flags and platform limits (guide 43's Feature Flags + Platform
 * Settings).
 *
 * The flag list is a constant rather than whatever keys happen to exist in the
 * document: a flag only means something if some code reads it, so the console
 * shows the flags this build understands instead of inviting an admin to
 * invent names nothing will ever check.
 */
const FLAGS = ["publicArtistPages", "discoverySearch"] as const;

export function PlatformSettings({
  flags,
  settings,
  loading,
  failed,
}: {
  flags: Record<string, unknown> | null;
  settings: Record<string, unknown> | null;
  loading: boolean;
  failed: boolean;
}) {
  const t = useTranslations("admin");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [limit, setLimit] = useState<string>(
    settings?.maxTicketsPerBooking !== undefined
      ? String(settings.maxTicketsPerBooking)
      : "",
  );
  const [supportEmail, setSupportEmail] = useState<string>(
    typeof settings?.supportEmail === "string" ? settings.supportEmail : "",
  );

  async function onToggle(key: string, enabled: boolean) {
    setBusy(key);
    setError(null);
    const result = await setFeatureFlag(key, enabled);
    setBusy(null);
    if (!result.ok) setError(result.errorKey);
  }

  async function onSaveSettings() {
    setBusy("settings");
    setError(null);
    const patch: { maxTicketsPerBooking?: number; supportEmail?: string } = {};
    if (limit.trim()) patch.maxTicketsPerBooking = Number(limit);
    if (supportEmail.trim()) patch.supportEmail = supportEmail.trim();
    const result = await updateSystemSettings(patch);
    setBusy(null);
    if (!result.ok) setError(result.errorKey);
  }

  if (loading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (failed) {
    return (
      <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {t("platform.failed")}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t(`errors.${error}`)}
        </p>
      ) : null}

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t("platform.flagsHeading")}
        </h2>
        <ul className="space-y-4">
          {FLAGS.map((key) => (
            <li key={key} className="flex items-center justify-between gap-4">
              <Label htmlFor={`flag-${key}`} className="text-sm font-normal">
                {t(`platform.flag.${key}`)}
              </Label>
              <Switch
                id={`flag-${key}`}
                checked={isFlagEnabled(flags, key)}
                disabled={busy === key}
                onCheckedChange={(next) => onToggle(key, next)}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t("platform.settingsHeading")}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="setting-limit">{t("platform.ticketLimit")}</Label>
            <Input
              id="setting-limit"
              type="number"
              min={1}
              max={100}
              value={limit}
              onChange={(event) => setLimit(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="setting-email">{t("platform.supportEmail")}</Label>
            <Input
              id="setting-email"
              type="email"
              value={supportEmail}
              onChange={(event) => setSupportEmail(event.target.value)}
            />
          </div>
        </div>

        <Button
          size="sm"
          onClick={onSaveSettings}
          disabled={busy === "settings"}
        >
          {t("platform.save")}
        </Button>
      </section>
    </div>
  );
}
