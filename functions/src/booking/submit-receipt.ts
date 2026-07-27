import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import type { CallableResponse } from "../lib/errors";
import { requireAuth } from "../lib/organization-guards";

type Payload = { bookingId?: string; receiptUrl?: string };

/**
 * Records the transfer receipt and moves the booking into the organizer's
 * review queue. The file itself is uploaded straight to Storage by the
 * attendee; this only records the URL and flips the status, so `pending_review`
 * always means "there is something to look at".
 */
export const submitReceipt = onCall<Payload, Promise<CallableResponse>>(
  async (request) => {
    const { uid } = requireAuth(request);
    const { bookingId, receiptUrl } = request.data ?? {};
    if (!bookingId || !receiptUrl) {
      throw new HttpsError("invalid-argument", "Missing receipt.", {
        code: "VALIDATION_ERROR",
      });
    }

    const db = getFirestore();
    const bookingRef = db.collection("bookings").doc(bookingId);
    const snapshot = await bookingRef.get();
    const booking = snapshot.data();
    if (!snapshot.exists || !booking) {
      throw new HttpsError("not-found", "Booking not found.", {
        code: "NOT_FOUND",
      });
    }
    // Only the attendee who opened the booking may attach its receipt.
    if (booking.attendeeId !== uid) {
      throw new HttpsError("permission-denied", "Not your booking.", {
        code: "PERMISSION_DENIED",
      });
    }
    if (booking.status !== "pending_payment" && booking.status !== "rejected") {
      throw new HttpsError(
        "failed-precondition",
        "Booking is not awaiting payment.",
        {
          code: "VALIDATION_ERROR",
        },
      );
    }

    // Must live under this caller's own receipt prefix for this event, and be
    // named for this booking. Storage rules guarantee the uid segment belongs
    // to the uploader; this ties the file to the booking as well.
    const expected = encodeURIComponent(
      `events/${booking.eventId}/receipts/${uid}/${bookingId}`,
    );
    if (
      !receiptUrl.startsWith("https://firebasestorage.googleapis.com/") ||
      !receiptUrl.includes(expected)
    ) {
      throw new HttpsError("invalid-argument", "Invalid receipt URL.", {
        code: "VALIDATION_ERROR",
      });
    }

    await bookingRef.update({
      status: "pending_review",
      rejectionReason: null,
      payment: { receiptUrl, submittedAt: FieldValue.serverTimestamp() },
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true, message: "Receipt submitted." };
  },
);
