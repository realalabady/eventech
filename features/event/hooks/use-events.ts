"use client";

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { getFirebaseFirestore } from "@/firebase/client";

import type { EventDoc } from "../types";

const EMPTY: EventDoc[] = [];

/**
 * Realtime event list for the caller's organization. Effects only subscribe;
 * empty states are derived during render so nothing sets state synchronously
 * inside an effect (React's cascading-render rule).
 */
export function useEvents(organizationId: string | undefined) {
  const { status } = useAuth();
  const [snapshot, setSnapshot] = useState<{
    key: string | null;
    items: EventDoc[];
  }>({ key: null, items: EMPTY });

  useEffect(() => {
    if (status !== "authenticated" || !organizationId) {
      return;
    }

    const eventsQuery = query(
      collection(getFirebaseFirestore(), "events"),
      where("organizationId", "==", organizationId),
      orderBy("createdAt", "desc"),
    );

    return onSnapshot(
      eventsQuery,
      (result) =>
        setSnapshot({
          key: organizationId,
          items: result.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as EventDoc,
          ),
        }),
      () => setSnapshot({ key: organizationId, items: EMPTY }),
    );
  }, [status, organizationId]);

  if (status !== "authenticated" || !organizationId) {
    return { events: EMPTY, loading: status === "loading" };
  }
  if (snapshot.key !== organizationId) {
    return { events: EMPTY, loading: true };
  }
  return { events: snapshot.items, loading: false };
}

/** Realtime single event, used by the wizard. */
export function useEvent(eventId: string | undefined) {
  const { status } = useAuth();
  const [snapshot, setSnapshot] = useState<{
    key: string | null;
    event: EventDoc | null;
  }>({ key: null, event: null });

  useEffect(() => {
    if (status !== "authenticated" || !eventId) {
      return;
    }

    return onSnapshot(
      doc(getFirebaseFirestore(), "events", eventId),
      (document) =>
        setSnapshot({
          key: eventId,
          event: document.exists()
            ? ({ id: document.id, ...document.data() } as EventDoc)
            : null,
        }),
      () => setSnapshot({ key: eventId, event: null }),
    );
  }, [status, eventId]);

  if (status !== "authenticated" || !eventId || snapshot.key !== eventId) {
    return { event: null, loading: true };
  }
  return { event: snapshot.event, loading: false };
}
