"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { AuthError } from "@/features/auth/components/auth-error";
import { AuthField } from "@/features/auth/components/auth-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

import { useOrganization } from "../hooks/use-organization";
import { useOrganizationPayment } from "../hooks/use-organization-payment";
import { updatePayment, updateProfile } from "../services/organization-service";
import {
  organizationProfileSchema,
  paymentSchema,
  type OrganizationProfileValues,
  type PaymentValues,
} from "../validation/organization-schemas";

import { BrandingSettings } from "./branding-settings";

function SectionHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-medium tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

export function OrganizationSettings() {
  const t = useTranslations("organization");
  const { organization, loading } = useOrganization();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  return (
    <div className="space-y-14">
      <section className="space-y-6">
        <SectionHeading
          title={t("settings.profileHeading")}
          hint={t("settings.profileHint")}
        />
        <ProfileForm organization={organization} />
      </section>

      <section className="space-y-6">
        <SectionHeading
          title={t("settings.brandingHeading")}
          hint={t("settings.brandingHint")}
        />
        <BrandingSettings organization={organization} />
      </section>

      <section className="space-y-6">
        <SectionHeading
          title={t("settings.paymentHeading")}
          hint={t("settings.paymentHint")}
        />
        <PaymentForm organization={organization} />
      </section>
    </div>
  );
}

function ProfileForm({
  organization,
}: {
  organization: NonNullable<ReturnType<typeof useOrganization>["organization"]>;
}) {
  const t = useTranslations("organization");
  const [error, setError] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationProfileValues>({
    resolver: zodResolver(organizationProfileSchema),
    defaultValues: {
      name: organization.name,
      description: organization.description ?? "",
      website: organization.website ?? "",
    },
  });

  // Keep the form in step with the realtime document (e.g. edited elsewhere).
  useEffect(() => {
    reset({
      name: organization.name,
      description: organization.description ?? "",
      website: organization.website ?? "",
    });
  }, [
    organization.name,
    organization.description,
    organization.website,
    reset,
  ]);

  async function onSubmit(values: OrganizationProfileValues) {
    setError(undefined);
    setSaved(false);
    const result = await updateProfile(organization.id, values);
    if (!result.ok) {
      setError(result.errorKey);
      return;
    }
    setSaved(true);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-lg space-y-5"
      noValidate
    >
      <AuthError message={error ? t(`errors.${error}`) : undefined} />

      <AuthField
        id="settings-name"
        label={t("create.nameLabel")}
        error={errors.name ? t(`errors.${errors.name.message}`) : undefined}
        {...register("name")}
      />

      <div className="grid gap-2">
        <Label htmlFor="settings-description">
          {t("create.descriptionLabel")}
        </Label>
        <Textarea
          id="settings-description"
          rows={3}
          {...register("description")}
        />
      </div>

      <AuthField
        id="settings-website"
        label={t("settings.websiteLabel")}
        placeholder={t("settings.websitePlaceholder")}
        error={
          errors.website ? t(`errors.${errors.website.message}`) : undefined
        }
        {...register("website")}
      />

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {t("settings.save")}
        </Button>
        {saved ? (
          <span className="text-sm text-success">{t("settings.saved")}</span>
        ) : null}
      </div>
    </form>
  );
}

function PaymentForm({
  organization,
}: {
  organization: NonNullable<ReturnType<typeof useOrganization>["organization"]>;
}) {
  const t = useTranslations("organization");
  const [error, setError] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);
  // Read from organizationPayments, not the organization document — see
  // features/organization/hooks/use-organization-payment.
  const { payment } = useOrganizationPayment(organization.id);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    // `values` rather than `defaultValues`: the payment document loads after
    // first render, and defaultValues are captured once so the fields would
    // stay blank for an organization that already has bank details.
    values: {
      bankName: payment?.bankName ?? "",
      accountHolder: payment?.accountHolder ?? "",
      iban: payment?.iban ?? "",
    },
  });

  async function onSubmit(values: PaymentValues) {
    setError(undefined);
    setSaved(false);
    const result = await updatePayment(organization.id, values);
    if (!result.ok) {
      setError(result.errorKey);
      return;
    }
    setSaved(true);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-lg space-y-5"
      noValidate
    >
      <AuthError message={error ? t(`errors.${error}`) : undefined} />

      <AuthField
        id="settings-bank"
        label={t("settings.bankNameLabel")}
        error={
          errors.bankName ? t(`errors.${errors.bankName.message}`) : undefined
        }
        {...register("bankName")}
      />
      <AuthField
        id="settings-holder"
        label={t("settings.accountHolderLabel")}
        error={
          errors.accountHolder
            ? t(`errors.${errors.accountHolder.message}`)
            : undefined
        }
        {...register("accountHolder")}
      />
      <AuthField
        id="settings-iban"
        label={t("settings.ibanLabel")}
        className="font-mono"
        error={errors.iban ? t(`errors.${errors.iban.message}`) : undefined}
        {...register("iban")}
      />

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {t("settings.save")}
        </Button>
        {saved ? (
          <span className="text-sm text-success">{t("settings.saved")}</span>
        ) : null}
      </div>
    </form>
  );
}
