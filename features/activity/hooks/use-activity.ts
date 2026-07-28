"use client";

import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { getFirebaseFirestore } from "@/firebase/client";

import type { ActivityDoc } from "../types";

const EMPTY: ActivityDoc[] = [];
const FEED_SIZE = 40;

/**
 * Recent activity for one event, newest first.
 *
 * This one genuinely needs `orderBy`, because the feed is capped and must take
 * the *latest* 40 rather than an arbitrary 40 — so it requires the composite
 * index `activityLogs(organizationId, eventId, createdAt)`. Without it the
 * listener errors, and `failed` surfaces that instead of showing a misleading
 * empty feed.
 *
 * `organizationId` is filtered as well as `eventId` because `firestore.rules`
 * grants through `isActiveMember(resource.data.organizationId)`, and rules are
 * not filters (gotcha #10) — without it Firestore rejected the whole list and
 * the feed rendered its error state permanently.
 */
export function useEventActivity(
  eventId: string | undefined,
  organizationId: string | undefined,
) {
  const { status } = useAuth();
  const [snapshot, setSnapshot] = useState<{
    key: string | null;
    items: ActivityDoc[];
    failed?: boolean;
  }>({ key: null, items: EMPTY });

  useEffect(() => {
    if (status !== "authenticated" || !eventId || !organizationId) return;

    return onSnapshot(
      query(
        collection(getFirebaseFirestore(), "activityLogs"),
        where("organizationId", "==", organizationId),
        where("eventId", "==", eventId),
        orderBy("createdAt", "desc"),
        limit(FEED_SIZE),
      ),
      (result) =>
        setSnapshot({
          key: eventId,
          items: result.docs.map(
            (document) =>
              ({ id: document.id, ...document.data() }) as ActivityDoc,
          ),
        }),
      (error) => {
        console.error("activity listener failed", error);
        setSnapshot({ key: eventId, items: EMPTY, failed: true });
      },
    );
  }, [status, eventId, organizationId]);

  if (status !== "authenticated" || !eventId || !organizationId) {
    return { activity: EMPTY, loading: false, failed: false };
  }
  if (snapshot.key !== eventId) {
    return { activity: EMPTY, loading: true, failed: false };
  }
  return {
    activity: snapshot.items,
    loading: false,
    failed: snapshot.failed ?? false,
  };
}
