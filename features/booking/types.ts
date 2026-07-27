import type { Timestamp } from "firebase/firestore";

import type { BookingStatus } from "@/types/domain";

export type BookingDoc = {
  id: string;
  eventId: string;
  organizationId: string;
  attendeeId: string;
  attendeeEmail: string | null;
  attendeeName: string | null;
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  amount: number;
  currency: string;
  /** Code the attendee puts in the bank transfer reference. */
  paymentReference: string;
  status: BookingStatus;
  payment: { receiptUrl: string; submittedAt: Timestamp | null } | null;
  rejectionReason: string | null;
  createdAt: Timestamp | null;
};

/** Statuses the attendee can still withdraw from. */
export function isCancellable(status: BookingStatus): boolean {
  return status === "pending_payment" || status === "pending_review";
}

/** Statuses that still want a receipt from the attendee. */
export function needsReceipt(status: BookingStatus): boolean {
  return status === "pending_payment" || status === "rejected";
}
