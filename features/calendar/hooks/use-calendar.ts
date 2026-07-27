"use client";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { getFirebaseFirestore } from "@/firebase/client";

import type { CalendarEntryDoc } from "../types";

const EMPTY: CalendarEntryDoc[] = [];

/**
 * Every calendar entry in the organization.
 *
 * Deliberately unordered: an `orderBy("startAt")` would need a composite index,
 * and pairing one with a `limit` would silently truncate the far future — the
 * one thing a calendar must never do. An organization's entries are few, so
 * they are sorted in memory instead, the same way `useOrganizationTasks` does.
 *
 * The listener error is surfaced, never swallowed (gotcha #4).
 */
export function useCalendarEntries(organizationId: string | undefined) {
  const { status } = useAuth();
  const [snapshot, setSnapshot] = useState<{
    key: string | null;
    items: CalendarEntryDoc[];
    failed?: boolean;
  }>({ key: null, items: EMPTY });

  useEffect(() => {
    if (status !== "authenticated" || !organizationId) return;

    return onSnapshot(
      query(
        collection(getFirebaseFirestore(), "calendarEvents"),
        where("organizationId", "==", organizationId),
      ),
      (result) =>
        setSnapshot({
          key: organizationId,
          items: result.docs.map(
            (document) =>
              ({ id: document.id, ...document.data() }) as CalendarEntryDoc,
          ),
        }),
      (error) => {
        console.error("calendar listener failed", error);
        setSnapshot({ key: organizationId, items: EMPTY, failed: true });
      },
    );
  }, [status, organizationId]);

  if (status !== "authenticated" || !organizationId) {
    return { entries: EMPTY, loading: status === "loading", failed: false };
  }
  if (snapshot.key !== organizationId) {
    return { entries: EMPTY, loading: true, failed: false };
  }
  return {
    entries: snapshot.items,
    loading: false,
    failed: snapshot.failed ?? false,
  };
}
