"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";

import type { AuthErrorKey } from "../lib/auth-errors";
import {
  resolvePostSignInPath,
  signInWithEmail,
} from "../services/auth-service";
import { loginSchema, type LoginValues } from "../validation/auth-schemas";

import { AuthError } from "./auth-error";
import { AuthField } from "./auth-field";
import { GoogleSignInButton } from "./google-sign-in-button";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [formError, setFormError] = useState<AuthErrorKey | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setFormError(undefined);
    const result = await signInWithEmail(values.email, values.password);
    if (!result.ok) {
      setFormError(result.errorKey);
      return;
    }
    router.replace(await resolvePostSignInPath());
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <AuthError message={formError ? t(`errors.${formError}`) : undefined} />

        <AuthField
          id="login-email"
          type="email"
          autoComplete="email"
          label={t("fields.email")}
          placeholder={t("fields.emailPlaceholder")}
          error={errors.email ? t(`errors.${errors.email.message}`) : undefined}
          {...register("email")}
        />

        <div className="space-y-2">
          <AuthField
            id="login-password"
            type="password"
            autoComplete="current-password"
            label={t("fields.password")}
            error={
              errors.password
                ? t(`errors.${errors.password.message}`)
                : undefined
            }
            {...register("password")}
          />
          <Link
            href="/forgot-password"
            className="inline-block text-sm text-muted-foreground underline-offset-4 transition-colors duration-[var(--motion-fast)] hover:text-foreground hover:underline"
          >
            {t("fields.forgotLink")}
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {t("login.submit")}
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
        {t("login.noAccount")}{" "}
        <Link
          href="/register"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {t("login.registerLink")}
        </Link>
      </p>
    </div>
  );
}
