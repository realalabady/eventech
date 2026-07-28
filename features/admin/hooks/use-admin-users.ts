"use client";

import { collection, limit, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { getFirebaseFirestore } from "@/firebase/client";

import type { AdminUser } from "../types";

const EMPTY: AdminUser[] = [];

/**
 * A realtime listener over an unbounded collection is a cost and memory problem
 * that only grows — the same trap the messaging thread is capped against. The
 * console reports when it is holding the cap rather than quietly implying these
 * are all the accounts there are.
 */
export const ADMIN_USER_CAP = 500;

/**
 * Every user on the platform, for the admin console.
 *
 * Unlike every other list in the app this is deliberately unfiltered: `users`
 * is `allow list: if isAdmin()` (rules, Phase 2), so the rule is satisfied by
 * the caller's claim rather than by a query constraint, and there is nothing to
 * scope it by. Sorted in memory by `compareUsers`.
 *
 * The listener error is surfaced, never swallowed — an admin who cannot tell
 * "no users" from "the query failed" will act on the wrong one (gotcha #4).
 */
export function useAdminUsers() {
  const { status, claims } = useAuth();
  const isAdmin = claims?.role === "admin";
  const [snapshot, setSnapshot] = useState<{
    loaded: boolean;
    items: AdminUser[];
    failed?: boolean;
  }>({ loaded: false, items: EMPTY });

  useEffect(() => {
    if (status !== "authenticated" || !isAdmin) return;

    return onSnapshot(
      query(collection(getFirebaseFirestore(), "users"), limit(ADMIN_USER_CAP)),
      (result) =>
        setSnapshot({
          loaded: true,
          items: result.docs.map(
            (document) =>
              ({ id: document.id, ...document.data() }) as AdminUser,
          ),
        }),
      (error) => {
        console.error("admin users listener failed", error);
        setSnapshot({ loaded: true, items: EMPTY, failed: true });
      },
    );
  }, [status, isAdmin]);

  if (status !== "authenticated" || !isAdmin) {
    return { users: EMPTY, loading: status === "loading", failed: false };
  }
  if (!snapshot.loaded) {
    return { users: EMPTY, loading: true, failed: false };
  }
  return {
    users: snapshot.items,
    loading: false,
    failed: snapshot.failed ?? false,
  };
}
