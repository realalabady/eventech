"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";

import type { AuthErrorKey } from "../lib/auth-errors";
import {
  resolvePostSignInPath,
  signInWithGoogle,
} from "../services/auth-service";

export function GoogleSignInButton({
  onError,
}: {
  onError: (key: AuthErrorKey) => void;
}) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    const result = await signInWithGoogle();
    setBusy(false);

    if (!result.ok) {
      onError(result.errorKey);
      return;
    }
    const destination = await resolvePostSignInPath();
    startTransition(() => router.replace(destination));
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full"
      disabled={busy || pending}
      onClick={handleClick}
    >
      {t("google")}
    </Button>
  );
}
