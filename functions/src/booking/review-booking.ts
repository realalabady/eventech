import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import { RESEND_API_KEY } from "../email/send-ticket-email";
import type { CallableResponse } from "../lib/errors";
import { requireAuth, requireMemberRole } from "../lib/organization-guards";
import { TICKET_QR_SECRET } from "../lib/qr";
import { issueTicketForBooking } from "../ticket/generate-ticket";

type TicketType = {
  id: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  sold: number;
};

/**
 * Approves a booking and claims its inventory.
 *
 * This is the real capacity gate. Requests are allowed to oversubscribe while
 * they sit in the queue, so the decrement happens inside a transaction that
 * re-reads the event: two organizers approving the last ticket at the same
 * moment cannot both succeed.
 *
 * Ticket issuance runs after the transaction commits, because rendering the QR
 * and writing it to Storage cannot participate in a Firestore transaction. It
 * is idempotent and keyed on the booking id, and the "already approved" branch
 * falls through to it as well — so a booking that got approved but failed to
 * produce a ticket is repaired simply by approving it again.
 *
 * A Firestore trigger would be the tidier decoupling, but Firestore lives in
 * me-central2 and Functions cannot run there (canonical §6); calling inline
 * avoids betting on cross-region Eventarc delivery.
 */
export const approveBooking = onCall<
  { bookingId?: string },
  Promise<CallableResponse>
>({ secrets: [TICKET_QR_SECRET, RESEND_API_KEY] }, async (request) => {
  const { uid } = requireAuth(request);
  const bookingId = request.data?.bookingId;
  if (!bookingId) {
    throw new HttpsError("invalid-argument", "bookingId required.", {
      code: "VALIDATION_ERROR",
    });
  }

  // Approving a booking is a financial action, so it is gated on a verified
  // email like publishing is (guide 38).
  if (request.auth?.token.email_verified !== true) {
    throw new HttpsError(
      "failed-precondition",
      "Confirm your email before approving bookings.",
      { code: "EMAIL_NOT_VERIFIED" },
    );
  }

  const db = getFirestore();
  const bookingRef = db.collection("bookings").doc(bookingId);
  const preview = (await bookingRef.get()).data();
  if (!preview) {
    throw new HttpsError("not-found", "Booking not found.", {
      code: "NOT_FOUND",
    });
  }
  await requireMemberRole(preview.organizationId, uid, ["owner", "manager"]);

  await db.runTransaction(async (tx) => {
    const bookingSnapshot = await tx.get(bookingRef);
    const booking = bookingSnapshot.data();
    if (!booking) {
      throw new HttpsError("not-found", "Booking not found.", {
        code: "NOT_FOUND",
      });
    }
    // Idempotent: a double-click must not claim inventory twice.
    if (booking.status === "approved") {
      return;
    }
    if (booking.status !== "pending_review") {
      throw new HttpsError(
        "failed-precondition",
        "Booking is not awaiting review.",
        {
          code: "VALIDATION_ERROR",
        },
      );
    }

    const eventRef = db.collection("events").doc(booking.eventId);
    const eventSnapshot = await tx.get(eventRef);
    const event = eventSnapshot.data();
    if (!event) {
      throw new HttpsError("not-found", "Event not found.", {
        code: "NOT_FOUND",
      });
    }

    const ticketTypes: TicketType[] = event.ticketTypes ?? [];
    const index = ticketTypes.findIndex((t) => t.id === booking.ticketTypeId);
    if (index === -1) {
      throw new HttpsError("not-found", "Ticket type no longer exists.", {
        code: "NOT_FOUND",
      });
    }
    const type = ticketTypes[index];
    if (type.quantity - type.sold < booking.quantity) {
      throw new HttpsError("failed-precondition", "Not enough tickets left.", {
        code: "EVENT_FULL",
      });
    }

    const updatedTypes = ticketTypes.map((t, i) =>
      i === index ? { ...t, sold: t.sold + booking.quantity } : t,
    );
    const soldTickets = updatedTypes.reduce((sum, t) => sum + t.sold, 0);
    const capacity = updatedTypes.reduce((sum, t) => sum + t.quantity, 0);

    tx.update(eventRef, {
      ticketTypes: updatedTypes,
      soldTickets,
      availableTickets: capacity - soldTickets,
      updatedAt: FieldValue.serverTimestamp(),
    });

    tx.update(bookingRef, {
      status: "approved",
      reviewedBy: uid,
      reviewedAt: FieldValue.serverTimestamp(),
      rejectionReason: null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    tx.set(db.collection("activityLogs").doc(), {
      organizationId: booking.organizationId,
      eventId: booking.eventId,
      actorId: uid,
      action: "approveBooking",
      resourceType: "booking",
      resourceId: bookingId,
      metadata: { quantity: booking.quantity },
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  try {
    await issueTicketForBooking(bookingId);
  } catch (error) {
    // The booking is approved and its inventory is claimed; only the ticket is
    // missing. Surface it so the organizer retries rather than assuming the
    // attendee was emailed a QR that does not exist.
    logger.error("Ticket issuance failed after approval", { bookingId, error });
    throw new HttpsError(
      "internal",
      "Booking approved, but the ticket could not be issued. Approve again to retry.",
      { code: "SERVER_ERROR" },
    );
  }

  return { success: true, message: "Booking approved." };
});

/** Rejects with a reason the attendee can act on. Claims no inventory. */
export const rejectBooking = onCall<
  { bookingId?: string; reason?: string },
  Promise<CallableResponse>
>(async (request) => {
  const { uid } = requireAuth(request);
  const { bookingId, reason } = request.data ?? {};
  if (!bookingId || !reason?.trim()) {
    throw new HttpsError("invalid-argument", "A reason is required.", {
      code: "VALIDATION_ERROR",
    });
  }

  const db = getFirestore();
  const bookingRef = db.collection("bookings").doc(bookingId);
  const booking = (await bookingRef.get()).data();
  if (!booking) {
    throw new HttpsError("not-found", "Booking not found.", {
      code: "NOT_FOUND",
    });
  }
  await requireMemberRole(booking.organizationId, uid, ["owner", "manager"]);

  if (booking.status !== "pending_review") {
    throw new HttpsError(
      "failed-precondition",
      "Booking is not awaiting review.",
      {
        code: "VALIDATION_ERROR",
      },
    );
  }

  await bookingRef.update({
    status: "rejected",
    rejectionReason: reason.trim().slice(0, 500),
    reviewedBy: uid,
    reviewedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { success: true, message: "Booking rejected." };
});

/** The attendee withdraws their own request while it is still open. */
export const cancelBooking = onCall<
  { bookingId?: string },
  Promise<CallableResponse>
>(async (request) => {
  const { uid } = requireAuth(request);
  const bookingId = request.data?.bookingId;
  if (!bookingId) {
    throw new HttpsError("invalid-argument", "bookingId required.", {
      code: "VALIDATION_ERROR",
    });
  }

  const db = getFirestore();
  const bookingRef = db.collection("bookings").doc(bookingId);
  const booking = (await bookingRef.get()).data();
  if (!booking) {
    throw new HttpsError("not-found", "Booking not found.", {
      code: "NOT_FOUND",
    });
  }
  if (booking.attendeeId !== uid) {
    throw new HttpsError("permission-denied", "Not your booking.", {
      code: "PERMISSION_DENIED",
    });
  }
  // Approved bookings hold inventory and a ticket; releasing those is a
  // refund path, which MVP does not have (guide 20 puts it in v2.0).
  if (
    booking.status !== "pending_payment" &&
    booking.status !== "pending_review"
  ) {
    throw new HttpsError(
      "failed-precondition",
      "This booking can no longer be cancelled.",
      {
        code: "VALIDATION_ERROR",
      },
    );
  }

  await bookingRef.update({
    status: "cancelled",
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { success: true, message: "Booking cancelled." };
});
