"use client";

import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { getFirebaseFirestore } from "@/firebase/client";

import type { BookingDoc } from "../types";

const EMPTY: BookingDoc[] = [];

type Snapshot = { key: string | null; items: BookingDoc[]; failed?: boolean };

function toBookings(
  docs: { id: string; data: () => Record<string, unknown> }[],
): BookingDoc[] {
  return docs.map((d) => ({ id: d.id, ...d.data() }) as BookingDoc);
}

/** The signed-in attendee's own bookings. */
export function useMyBookings() {
  const { status, user } = useAuth();
  const uid = user?.uid ?? null;
  const [snapshot, setSnapshot] = useState<Snapshot>({
    key: null,
    items: EMPTY,
  });

  useEffect(() => {
    if (status !== "authenticated" || !uid) return;

    return onSnapshot(
      query(
        collection(getFirebaseFirestore(), "bookings"),
        where("attendeeId", "==", uid),
      ),
      (result) => setSnapshot({ key: uid, items: toBookings(result.docs) }),
      (error) => {
        console.error("bookings listener failed", error);
        setSnapshot({ key: uid, items: EMPTY, failed: true });
      },
    );
  }, [status, uid]);

  if (status !== "authenticated" || !uid) {
    return { bookings: EMPTY, loading: status === "loading", failed: false };
  }
  if (snapshot.key !== uid) {
    return { bookings: EMPTY, loading: true, failed: false };
  }
  return {
    bookings: snapshot.items,
    loading: false,
    failed: snapshot.failed ?? false,
  };
}

/** Every booking for the organizer's own organization. */
export function useOrganizationBookings(organizationId: string | undefined) {
  const { status } = useAuth();
  const [snapshot, setSnapshot] = useState<Snapshot>({
    key: null,
    items: EMPTY,
  });

  useEffect(() => {
    if (status !== "authenticated" || !organizationId) return;

    return onSnapshot(
      query(
        collection(getFirebaseFirestore(), "bookings"),
        where("organizationId", "==", organizationId),
      ),
      (result) =>
        setSnapshot({ key: organizationId, items: toBookings(result.docs) }),
      (error) => {
        console.error("org bookings listener failed", error);
        setSnapshot({ key: organizationId, items: EMPTY, failed: true });
      },
    );
  }, [status, organizationId]);

  if (status !== "authenticated" || !organizationId) {
    return { bookings: EMPTY, loading: status === "loading", failed: false };
  }
  if (snapshot.key !== organizationId) {
    return { bookings: EMPTY, loading: true, failed: false };
  }
  return {
    bookings: snapshot.items,
    loading: false,
    failed: snapshot.failed ?? false,
  };
}

/** A single booking, for the attendee's payment-instructions page. */
export function useBooking(bookingId: string | undefined) {
  const { status } = useAuth();
  const [snapshot, setSnapshot] = useState<{
    key: string | null;
    booking: BookingDoc | null;
  }>({ key: null, booking: null });

  useEffect(() => {
    if (status !== "authenticated" || !bookingId) return;

    return onSnapshot(
      doc(getFirebaseFirestore(), "bookings", bookingId),
      (document) =>
        setSnapshot({
          key: bookingId,
          booking: document.exists()
            ? ({ id: document.id, ...document.data() } as BookingDoc)
            : null,
        }),
      () => setSnapshot({ key: bookingId, booking: null }),
    );
  }, [status, bookingId]);

  if (status !== "authenticated" || !bookingId || snapshot.key !== bookingId) {
    return { booking: null, loading: true };
  }
  return { booking: snapshot.booking, loading: false };
}
