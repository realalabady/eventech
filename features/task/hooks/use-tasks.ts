"use client";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { getFirebaseFirestore } from "@/firebase/client";

import type { TaskDoc } from "../types";

const EMPTY: TaskDoc[] = [];

/**
 * Every task in the organization, filtered client-side by event.
 *
 * Filtering in memory rather than per-event keeps one listener open instead of
 * remounting it on each filter change, and an organization's task count is
 * small. The listener error is surfaced, never swallowed — a missing index
 * otherwise renders as an empty board.
 */
export function useOrganizationTasks(organizationId: string | undefined) {
  const { status } = useAuth();
  const [snapshot, setSnapshot] = useState<{
    key: string | null;
    items: TaskDoc[];
    failed?: boolean;
  }>({ key: null, items: EMPTY });

  useEffect(() => {
    if (status !== "authenticated" || !organizationId) return;

    return onSnapshot(
      query(
        collection(getFirebaseFirestore(), "tasks"),
        where("organizationId", "==", organizationId),
      ),
      (result) =>
        setSnapshot({
          key: organizationId,
          items: result.docs.map(
            (document) => ({ id: document.id, ...document.data() }) as TaskDoc,
          ),
        }),
      (error) => {
        console.error("tasks listener failed", error);
        setSnapshot({ key: organizationId, items: EMPTY, failed: true });
      },
    );
  }, [status, organizationId]);

  if (status !== "authenticated" || !organizationId) {
    return { tasks: EMPTY, loading: status === "loading", failed: false };
  }
  if (snapshot.key !== organizationId) {
    return { tasks: EMPTY, loading: true, failed: false };
  }
  return {
    tasks: snapshot.items,
    loading: false,
    failed: snapshot.failed ?? false,
  };
}
