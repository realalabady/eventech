"use client";

import { useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "@/i18n/navigation";

import { useAuth } from "../hooks/use-auth";

/**
 * Client-side route guard. This is a UX affordance only — real enforcement
 * lives in Firestore rules and Cloud Functions (canonical §7): never trust the
 * client for authorization.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" || status === "unconfigured") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="mx-auto w-full max-w-md space-y-4 px-4 py-24">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  return children;
}
