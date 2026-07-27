"use client";

import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { getFirebaseFirestore } from "@/firebase/client";

import type { TicketDoc } from "../types";

const EMPTY: TicketDoc[] = [];

type Snapshot = { key: string | null; items: TicketDoc[]; failed?: boolean };

/**
 * The signed-in attendee's ticket wallet.
 *
 * The listener error is surfaced rather than swallowed: a missing index makes a
 * broken query look exactly like an empty wallet, which has already cost this
 * project a debugging session.
 */
export function useMyTickets() {
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
        collection(getFirebaseFirestore(), "tickets"),
        where("ownerId", "==", uid),
      ),
      (result) =>
        setSnapshot({
          key: uid,
          items: result.docs.map(
            (document) =>
              ({ id: document.id, ...document.data() }) as TicketDoc,
          ),
        }),
      (error) => {
        console.error("tickets listener failed", error);
        setSnapshot({ key: uid, items: EMPTY, failed: true });
      },
    );
  }, [status, uid]);

  if (status !== "authenticated" || !uid) {
    return { tickets: EMPTY, loading: status === "loading", failed: false };
  }
  if (snapshot.key !== uid) {
    return { tickets: EMPTY, loading: true, failed: false };
  }
  return {
    tickets: snapshot.items,
    loading: false,
    failed: snapshot.failed ?? false,
  };
}

/** One ticket, for the full-screen QR the attendee shows at the door. */
export function useTicket(ticketId: string | undefined) {
  const { status } = useAuth();
  const [snapshot, setSnapshot] = useState<{
    key: string | null;
    ticket: TicketDoc | null;
  }>({ key: null, ticket: null });

  useEffect(() => {
    if (status !== "authenticated" || !ticketId) return;

    return onSnapshot(
      doc(getFirebaseFirestore(), "tickets", ticketId),
      (document) =>
        setSnapshot({
          key: ticketId,
          ticket: document.exists()
            ? ({ id: document.id, ...document.data() } as TicketDoc)
            : null,
        }),
      (error) => {
        console.error("ticket listener failed", error);
        setSnapshot({ key: ticketId, ticket: null });
      },
    );
  }, [status, ticketId]);

  if (status !== "authenticated" || !ticketId || snapshot.key !== ticketId) {
    return { ticket: null, loading: true };
  }
  return { ticket: snapshot.ticket, loading: false };
}
