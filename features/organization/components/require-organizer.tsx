"use client";

import { useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useRouter } from "@/i18n/navigation";

/**
 * Gate for /workspace. UX only — Firestore rules and Cloud Functions are the
 * real authorization boundary (canonical §7).
 */
export function RequireOrganizer({ children }: { children: React.ReactNode }) {
  const { status, claims } = useAuth();
  const router = useRouter();
  const hasOrganization = Boolean(claims?.organizationId);

  useEffect(() => {
    if (status === "unauthenticated" || status === "unconfigured") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated" && !hasOrganization) {
      router.replace("/organizer/new");
    }
  }, [status, hasOrganization, router]);

  if (status !== "authenticated" || !hasOrganization) {
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
