import type { Timestamp } from "firebase/firestore";

import type { TicketStatus } from "@/types/domain";

export type TicketDoc = {
  id: string;
  bookingId: string;
  eventId: string;
  organizationId: string;
  ownerId: string;
  ownerName: string | null;
  eventTitle: string;
  eventStartDate: Timestamp | null;
  /**
   * The event's IANA zone, copied at issuance. A ticket must show the door time
   * where the door is, not where the phone is — and not UTC, which is what it
   * fell back to before this field existed.
   *
   * Optional because `use-tickets` casts raw Firestore data: a ticket issued
   * before this field existed has no such key at all until
   * `functions/scripts/backfill-ticket-timezone.mjs` runs. Absent renders UTC,
   * the same as the old behaviour.
   */
  eventTimezone?: string | null;
  ticketTypeName: string;
  quantity: number;
  /** Signed token encoded in the QR. Never rendered as text to the attendee. */
  qrToken: string;
  /** Tokenised Storage URL of the rendered QR PNG. */
  qrImage: string;
  status: TicketStatus;
  usedAt: Timestamp | null;
  emailSentAt: Timestamp | null;
  createdAt: Timestamp | null;
};

export type WalletBucket = "upcoming" | "used" | "past";

/**
 * Which shelf of the wallet a ticket sits on (guide 40).
 *
 * A used ticket stays "used" even for a future event — that is the state the
 * attendee cares about at the door. Everything else falls back to whether the
 * event has already happened.
 */
export function walletBucket(ticket: TicketDoc, now: number): WalletBucket {
  if (ticket.status === "used") return "used";
  const startsAt = ticket.eventStartDate?.toMillis() ?? null;
  if (startsAt !== null && startsAt < now) return "past";
  return ticket.status === "cancelled" ? "past" : "upcoming";
}
