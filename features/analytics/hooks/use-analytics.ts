"use client";

import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  where,
  type Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { getFirebaseFirestore } from "@/firebase/client";
import type { BookingStatus } from "@/types/domain";

import { EMPTY_METRICS, toDailySeries, type EventMetrics } from "../types";

type State = {
  metrics: EventMetrics;
  loading: boolean;
  failed: boolean;
};

/**
 * Metrics for one event, aggregated on read.
 *
 * Deliberately a one-shot fetch rather than a realtime listener: a dashboard
 * that reshuffles under the reader is hostile, and canonical §9 wants the
 * counters and charts to animate **once**. Changing the event refetches.
 *
 * Three round trips, and no composite index beyond what already exists:
 *   - the event document, for view count and ticket tiers
 *   - every booking for the event (equality only), which yields the status
 *     breakdown and the time series from one read set
 *   - a server-side *count* of used tickets, which is billed per ~1000 index
 *     entries rather than per document, on the existing `tickets(eventId,status)`
 */
export function useEventMetrics(eventId: string | undefined): State {
  const { status } = useAuth();
  const [state, setState] = useState<{
    key: string | null;
    metrics: EventMetrics;
    failed: boolean;
  }>({ key: null, metrics: EMPTY_METRICS, failed: false });

  useEffect(() => {
    if (status !== "authenticated" || !eventId) return;

    let cancelled = false;

    async function load(id: string) {
      const db = getFirebaseFirestore();
      try {
        const [eventSnapshot, bookingSnapshot, attendedSnapshot] =
          await Promise.all([
            getDoc(doc(db, "events", id)),
            getDocs(
              query(collection(db, "bookings"), where("eventId", "==", id)),
            ),
            getCountFromServer(
              query(
                collection(db, "tickets"),
                where("eventId", "==", id),
                where("status", "==", "used"),
              ),
            ),
          ]);

        if (cancelled) return;

        const event = eventSnapshot.data();
        const byStatus = { ...EMPTY_METRICS.byStatus };
        const instants: number[] = [];

        for (const booking of bookingSnapshot.docs) {
          const data = booking.data() as {
            status?: BookingStatus;
            createdAt?: Timestamp | null;
          };
          if (data.status && data.status in byStatus) {
            byStatus[data.status] += 1;
          }
          const created = data.createdAt?.toMillis();
          if (created) instants.push(created);
        }

        const tiers = (
          (event?.ticketTypes ?? []) as {
            id: string;
            name: string;
            quantity: number;
            sold: number;
          }[]
        ).map((tier) => ({
          id: tier.id,
          name: tier.name,
          sold: tier.sold ?? 0,
          remaining: Math.max(0, (tier.quantity ?? 0) - (tier.sold ?? 0)),
        }));

        setState({
          key: id,
          failed: false,
          metrics: {
            views: event?.stats?.views ?? 0,
            bookings: bookingSnapshot.size,
            approved: byStatus.approved,
            attended: attendedSnapshot.data().count,
            byStatus,
            tiers,
            daily: toDailySeries(instants),
          },
        });
      } catch (error) {
        // A missing index or a rules change must not render as a dashboard full
        // of confident zeroes — that reads as "nothing happened" (gotcha #4).
        console.error("analytics load failed", error);
        if (!cancelled) {
          setState({ key: id, metrics: EMPTY_METRICS, failed: true });
        }
      }
    }

    void load(eventId);
    return () => {
      cancelled = true;
    };
  }, [status, eventId]);

  if (status !== "authenticated" || !eventId) {
    return { metrics: EMPTY_METRICS, loading: false, failed: false };
  }
  if (state.key !== eventId) {
    return { metrics: EMPTY_METRICS, loading: true, failed: false };
  }
  return { metrics: state.metrics, loading: false, failed: state.failed };
}
