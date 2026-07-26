"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";

import type { AuthErrorKey } from "../lib/auth-errors";
import { registerWithEmail } from "../services/auth-service";
import {
  registerSchema,
  type RegisterValues,
} from "../validation/auth-schemas";

import { AuthError } from "./auth-error";
import { AuthField } from "./auth-field";
import { GoogleSignInButton } from "./google-sign-in-button";

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [formError, setFormError] = useState<AuthErrorKey | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: "", email: "", password: "" },
  });

  async function onSubmit(values: RegisterValues) {
    setFormError(undefined);
    const result = await registerWithEmail(
      values.displayName,
      values.email,
      values.password,
    );
    if (!result.ok) {
      setFormError(result.errorKey);
      return;
    }
    router.replace("/verify-email");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <AuthError message={formError ? t(`errors.${formError}`) : undefined} />

        <AuthField
          id="register-name"
          autoComplete="name"
          label={t("fields.name")}
          placeholder={t("fields.namePlaceholder")}
          error={
            errors.displayName
              ? t(`errors.${errors.displayName.message}`)
              : undefined
          }
          {...register("displayName")}
        />

        <AuthField
          id="register-email"
          type="email"
          autoComplete="email"
          label={t("fields.email")}
          placeholder={t("fields.emailPlaceholder")}
          error={errors.email ? t(`errors.${errors.email.message}`) : undefined}
          {...register("email")}
        />

        <AuthField
          id="register-password"
          type="password"
          autoComplete="new-password"
          label={t("fields.password")}
          hint={t("fields.passwordHint")}
          error={
            errors.password ? t(`errors.${errors.password.message}`) : undefined
          }
          {...register("password")}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {t("register.submit")}
        </Button>
      </form>

      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground uppercase">
          {t("divider")}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleSignInButton onError={setFormError} />

      <p className="text-center text-sm text-muted-foreground">
        {t("register.hasAccount")}{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {t("register.loginLink")}
        </Link>
      </p>
    </div>
  );
}
