import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import type { CallableResponse } from "../lib/errors";
import { requireAuth } from "../lib/organization-guards";
import { enforceRateLimit } from "../lib/rate-limit";

type Payload = { eventId?: string; ticketTypeId?: string; quantity?: number };

const MAX_PER_BOOKING = 10;

/**
 * Human-readable code the attendee puts in the bank transfer reference so the
 * organizer can match a payment to a booking. Ambiguous characters are left
 * out because this gets retyped by hand into banking apps.
 */
function paymentReference(bookingId: string): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code +=
      alphabet[bookingId.charCodeAt(i % bookingId.length) % alphabet.length];
  }
  return `EV-${code}`;
}

/**
 * Opens a booking request in `pending_payment`. No money moves here: the
 * attendee transfers out of band and uploads a receipt, and the organizer
 * approves (canonical §5).
 *
 * The capacity check here is deliberately advisory — pending bookings may
 * collectively exceed capacity. Approval is the real gate and re-checks in a
 * transaction.
 */
export const createBooking = onCall<
  Payload,
  Promise<CallableResponse<{ bookingId: string }>>
>(async (request) => {
  const { uid } = requireAuth(request);
  const { eventId, ticketTypeId } = request.data ?? {};
  const quantity = Number(request.data?.quantity ?? 1);

  if (!eventId || !ticketTypeId) {
    throw new HttpsError("invalid-argument", "Missing event or ticket type.", {
      code: "VALIDATION_ERROR",
    });
  }
  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_PER_BOOKING
  ) {
    throw new HttpsError("invalid-argument", "Invalid quantity.", {
      code: "VALIDATION_ERROR",
    });
  }

  // After validation, before the inventory transaction: a malformed payload
  // must not spend the caller's allowance, and an over-budget caller must not
  // reach the expensive part.
  await enforceRateLimit("createBooking", request);

  const db = getFirestore();
  const eventSnapshot = await db.collection("events").doc(eventId).get();
  const event = eventSnapshot.data();
  if (!eventSnapshot.exists || !event) {
    throw new HttpsError("not-found", "Event not found.", {
      code: "NOT_FOUND",
    });
  }
  if (event.status !== "published" || !event.bookingOpen) {
    throw new HttpsError("failed-precondition", "Bookings are closed.", {
      code: "BOOKING_CLOSED",
    });
  }

  const ticketType = (event.ticketTypes ?? []).find(
    (type: { id: string }) => type.id === ticketTypeId,
  );
  if (!ticketType) {
    throw new HttpsError("not-found", "Ticket type not found.", {
      code: "NOT_FOUND",
    });
  }
  if (ticketType.quantity - ticketType.sold < quantity) {
    throw new HttpsError("failed-precondition", "Not enough tickets left.", {
      code: "EVENT_FULL",
    });
  }

  // One open request per attendee per event keeps the organizer's queue honest.
  const existing = await db
    .collection("bookings")
    .where("eventId", "==", eventId)
    .where("attendeeId", "==", uid)
    .where("status", "in", ["pending_payment", "pending_review", "approved"])
    .limit(1)
    .get();
  if (!existing.empty) {
    throw new HttpsError("already-exists", "You already have a booking.", {
      code: "ALREADY_EXISTS",
    });
  }

  const bookingRef = db.collection("bookings").doc();
  const now = FieldValue.serverTimestamp();

  await bookingRef.set({
    id: bookingRef.id,
    eventId,
    organizationId: event.organizationId,
    attendeeId: uid,
    attendeeEmail: request.auth?.token.email ?? null,
    attendeeName: request.auth?.token.name ?? null,
    ticketTypeId,
    ticketTypeName: ticketType.name,
    quantity,
    // Priced server-side; a client-supplied amount is never trusted.
    amount: ticketType.price * quantity,
    currency: ticketType.currency,
    paymentReference: paymentReference(bookingRef.id),
    status: "pending_payment",
    payment: null,
    rejectionReason: null,
    ticketId: null,
    createdAt: now,
    updatedAt: now,
  });

  return {
    success: true,
    message: "Booking created.",
    data: { bookingId: bookingRef.id },
  };
});
