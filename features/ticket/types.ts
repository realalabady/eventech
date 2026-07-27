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
