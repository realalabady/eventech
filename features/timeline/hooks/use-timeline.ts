"use client";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { getFirebaseFirestore } from "@/firebase/client";

import type { TimelineDoc } from "../types";

const EMPTY: TimelineDoc[] = [];

/**
 * The six milestones for one event, ordered.
 *
 * Sorting happens in memory rather than with `orderBy`, so no composite index
 * is needed for a six-document read — and a missing index can therefore never
 * make a populated timeline render as an empty one.
 *
 * The `organizationId` filter is not redundant with `eventId`. `firestore.rules`
 * grants reads through `isActiveMember(resource.data.organizationId)`, and rules
 * are not filters (gotcha #10) — a query that does not constrain the same field
 * the rule tests is rejected wholesale, which is what made this listener fail
 * with `permission-denied` and render the timeline as permanently broken.
 */
export function useEventTimeline(
  eventId: string | undefined,
  organizationId: string | undefined,
) {
  const { status } = useAuth();
  const [snapshot, setSnapshot] = useState<{
    key: string | null;
    items: TimelineDoc[];
    failed?: boolean;
  }>({ key: null, items: EMPTY });

  useEffect(() => {
    if (status !== "authenticated" || !eventId || !organizationId) return;

    return onSnapshot(
      query(
        collection(getFirebaseFirestore(), "timeline"),
        where("organizationId", "==", organizationId),
        where("eventId", "==", eventId),
      ),
      (result) =>
        setSnapshot({
          key: eventId,
          items: result.docs
            .map(
              (document) =>
                ({ id: document.id, ...document.data() }) as TimelineDoc,
            )
            .sort((a, b) => a.order - b.order),
        }),
      (error) => {
        console.error("timeline listener failed", error);
        setSnapshot({ key: eventId, items: EMPTY, failed: true });
      },
    );
  }, [status, eventId, organizationId]);

  if (status !== "authenticated" || !eventId || !organizationId) {
    return { stages: EMPTY, loading: false, failed: false };
  }
  if (snapshot.key !== eventId) {
    return { stages: EMPTY, loading: true, failed: false };
  }
  return {
    stages: snapshot.items,
    loading: false,
    failed: snapshot.failed ?? false,
  };
}
