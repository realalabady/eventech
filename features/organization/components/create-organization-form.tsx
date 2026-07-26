"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthError } from "@/features/auth/components/auth-error";
import { AuthField } from "@/features/auth/components/auth-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";

import { createOrganization } from "../services/organization-service";
import {
  createOrganizationSchema,
  type CreateOrganizationValues,
} from "../validation/organization-schemas";

export function CreateOrganizationForm() {
  const t = useTranslations("organization");
  const router = useRouter();
  const [formError, setFormError] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrganizationValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { name: "", description: "" },
  });

  async function onSubmit(values: CreateOrganizationValues) {
    setFormError(undefined);
    const result = await createOrganization(values);
    if (!result.ok) {
      setFormError(result.errorKey);
      return;
    }
    // The organizer claim was just written; refresh so the guard sees it.
    router.replace("/workspace/settings");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <AuthError message={formError ? t(`errors.${formError}`) : undefined} />

      <AuthField
        id="org-name"
        label={t("create.nameLabel")}
        placeholder={t("create.namePlaceholder")}
        error={errors.name ? t(`errors.${errors.name.message}`) : undefined}
        {...register("name")}
      />

      <div className="grid gap-2">
        <Label htmlFor="org-description">{t("create.descriptionLabel")}</Label>
        <Textarea
          id="org-description"
          rows={3}
          placeholder={t("create.descriptionPlaceholder")}
          {...register("description")}
        />
        {errors.description ? (
          <p role="alert" className="text-sm text-destructive">
            {t(`errors.${errors.description.message}`)}
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {t("create.submit")}
        </Button>
        <p className="text-sm text-muted-foreground">{t("create.note")}</p>
      </div>
    </form>
  );
}
