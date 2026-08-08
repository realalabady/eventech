"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";

import { signOut } from "../services/auth-service";

/**
 * Sign-out affordance for persistent shells (workspace sidebar, admin rail).
 * The account page keeps its own button inside `AccountPanel`.
 */
export function SignOutButton({ className }: { className?: string }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleSignOut() {
    setBusy(true);
    await signOut();
    router.replace("/login");
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={busy}
      onClick={handleSignOut}
      className={className}
    >
      <LogOut className="size-4 shrink-0" aria-hidden="true" />
      {t("account.signOut")}
    </Button>
  );
}
