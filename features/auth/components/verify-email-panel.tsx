"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";

import { useAuth } from "../hooks/use-auth";
import type { AuthErrorKey } from "../lib/auth-errors";
import { resendVerificationEmail } from "../services/auth-service";

import { AuthError } from "./auth-error";

export function VerifyEmailPanel() {
  const t = useTranslations("auth");
  const { status, user } = useAuth();
  const [error, setError] = useState<AuthErrorKey | undefined>();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  if (status === "loading") {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (user?.emailVerified) {
    return (
      <div className="space-y-6">
        <p className="rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {t("verify.verified")}
        </p>
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/account" />}
        >
          {t("verify.continue")}
        </Button>
      </div>
    );
  }

  async function handleResend() {
    setBusy(true);
    setError(undefined);
    const result = await resendVerificationEmail();
    setBusy(false);
    if (!result.ok) {
      setError(result.errorKey);
      return;
    }
    setSent(true);
  }

  return (
    <div className="space-y-6">
      <AuthError message={error ? t(`errors.${error}`) : undefined} />

      <p className="text-muted-foreground">
        {t("verify.subtitle", { email: user?.email ?? "" })}
      </p>

      {sent ? (
        <p className="rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {t("verify.sent")}
        </p>
      ) : (
        <Button
          size="lg"
          variant="outline"
          disabled={busy}
          onClick={handleResend}
        >
          {t("verify.resend")}
        </Button>
      )}
    </div>
  );
}
