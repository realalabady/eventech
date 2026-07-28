"use client";

import { useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useRouter } from "@/i18n/navigation";

/**
 * Gate for /admin. UX only — Firestore rules and the callables' `requireAdmin`
 * are the real authorization boundary (canonical §7). A forged claim in the
 * browser gets an admin-shaped shell and nothing behind it.
 *
 * Non-admins go home rather than to /login: they are signed in perfectly well,
 * they simply have no business here, and bouncing them to a login form would
 * suggest otherwise.
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { status, claims } = useAuth();
  const router = useRouter();
  const isAdmin = claims?.role === "admin";

  useEffect(() => {
    if (status === "unauthenticated" || status === "unconfigured") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated" && !isAdmin) {
      router.replace("/");
    }
  }, [status, isAdmin, router]);

  if (status !== "authenticated" || !isAdmin) {
    return (
      <div className="space-y-4 p-8">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  return children;
}
