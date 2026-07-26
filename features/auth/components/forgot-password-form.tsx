"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

import type { AuthErrorKey } from "../lib/auth-errors";
import { sendPasswordReset } from "../services/auth-service";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "../validation/auth-schemas";

import { AuthError } from "./auth-error";
import { AuthField } from "./auth-field";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [formError, setFormError] = useState<AuthErrorKey | undefined>();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setFormError(undefined);
    const result = await sendPasswordReset(values.email);
    // Always report success for real failures other than config problems, so the
    // form cannot be used to discover which emails have accounts.
    if (!result.ok && result.errorKey === "notConfigured") {
      setFormError(result.errorKey);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-6">
        <p className="rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {t("forgot.sent")}
        </p>
        <Link
          href="/login"
          className="inline-block text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {t("forgot.backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <AuthError message={formError ? t(`errors.${formError}`) : undefined} />

      <AuthField
        id="forgot-email"
        type="email"
        autoComplete="email"
        label={t("fields.email")}
        placeholder={t("fields.emailPlaceholder")}
        error={errors.email ? t(`errors.${errors.email.message}`) : undefined}
        {...register("email")}
      />

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {t("forgot.submit")}
      </Button>

      <Link
        href="/login"
        className="inline-block text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        {t("forgot.backToLogin")}
      </Link>
    </form>
  );
}
