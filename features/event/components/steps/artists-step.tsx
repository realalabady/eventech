"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthError } from "@/features/auth/components/auth-error";
import { AuthField } from "@/features/auth/components/auth-field";

import type { StepProps } from "../event-wizard";
import { createArtist } from "../../services/event-service";
import {
  artistSchema,
  type ArtistValues,
} from "../../validation/event-schemas";

export function ArtistsStep({
  event,
  organizationId,
  save,
  onDone,
}: StepProps) {
  const t = useTranslations("event");
  const [error, setError] = useState<string | undefined>();
  // Names are kept locally purely for display; ids are the saved source of truth.
  const [names, setNames] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ArtistValues>({
    resolver: zodResolver(artistSchema),
    defaultValues: { name: "" },
  });

  async function onAdd(values: ArtistValues) {
    setError(undefined);
    const created = await createArtist(organizationId, values.name);
    if (!created.ok) {
      setError(created.errorKey);
      return;
    }
    const artistId = created.data?.artistId;
    if (!artistId) return;

    const nextIds = [...(event.artistIds ?? []), artistId];
    if (await save({ artistIds: nextIds })) {
      setNames((current) => [...current, values.name]);
      reset({ name: "" });
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-medium tracking-tight">
          {t("artists.heading")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("artists.hint")}</p>
      </div>

      <AuthError message={error ? t(`errors.${error}`) : undefined} />

      {names.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {names.map((name) => (
            <li key={name}>
              <Badge variant="secondary">{name}</Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{t("artists.empty")}</p>
      )}

      <form
        onSubmit={handleSubmit(onAdd)}
        className="flex items-end gap-3"
        noValidate
      >
        <div className="flex-1">
          <AuthField
            id="artist-name"
            label={t("artists.nameLabel")}
            placeholder={t("artists.namePlaceholder")}
            error={errors.name ? t(`errors.${errors.name.message}`) : undefined}
            {...register("name")}
          />
        </div>
        <Button type="submit" variant="outline" disabled={isSubmitting}>
          {t("artists.add")}
        </Button>
      </form>

      <Button type="button" onClick={onDone}>
        {t("wizard.next")}
      </Button>
    </div>
  );
}
