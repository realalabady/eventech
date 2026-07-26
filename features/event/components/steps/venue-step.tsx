"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { AuthError } from "@/features/auth/components/auth-error";
import { AuthField } from "@/features/auth/components/auth-field";

import type { StepProps } from "../event-wizard";
import { createVenue } from "../../services/event-service";
import { venueSchema, type VenueValues } from "../../validation/event-schemas";

/**
 * Venues are their own collection referenced by id, so the same room can be
 * reused across events and later gets a public page (guide 50 §5).
 */
export function VenueStep({ event, organizationId, save, onDone }: StepProps) {
  const t = useTranslations("event");
  const [error, setError] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VenueValues>({
    resolver: zodResolver(venueSchema),
    defaultValues: { name: "", address: "", city: "" },
  });

  async function onSubmit(values: VenueValues) {
    setError(undefined);
    const created = await createVenue(organizationId, values);
    if (!created.ok) {
      setError(created.errorKey);
      return;
    }
    if (await save({ venueId: created.data?.venueId })) {
      onDone();
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-lg space-y-5"
      noValidate
    >
      <h2 className="text-lg font-medium tracking-tight">
        {t("venue.heading")}
      </h2>

      <AuthError message={error ? t(`errors.${error}`) : undefined} />

      {/*
        A venue is already attached: offer to move on rather than forcing the
        organizer to retype it, which would create a duplicate venue document
        on every pass through the wizard.
      */}
      {event.venueId ? (
        <div className="space-y-3">
          <p className="rounded-md border border-success/30 bg-success/10 px-4 py-2.5 text-sm text-success">
            {t("venue.current")}
          </p>
          <Button type="button" onClick={onDone}>
            {t("wizard.next")}
          </Button>
        </div>
      ) : null}

      <AuthField
        id="venue-name"
        label={t("venue.nameLabel")}
        placeholder={t("venue.namePlaceholder")}
        error={errors.name ? t(`errors.${errors.name.message}`) : undefined}
        {...register("name")}
      />
      <AuthField
        id="venue-address"
        label={t("venue.addressLabel")}
        placeholder={t("venue.addressPlaceholder")}
        error={
          errors.address ? t(`errors.${errors.address.message}`) : undefined
        }
        {...register("address")}
      />
      <AuthField
        id="venue-city"
        label={t("venue.cityLabel")}
        placeholder={t("venue.cityPlaceholder")}
        error={errors.city ? t(`errors.${errors.city.message}`) : undefined}
        {...register("city")}
      />

      <Button type="submit" disabled={isSubmitting}>
        {t("venue.add")}
      </Button>
    </form>
  );
}
