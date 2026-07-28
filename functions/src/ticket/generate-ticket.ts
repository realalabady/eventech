import { getStorage } from "firebase-admin/storage";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { toBuffer } from "qrcode";

import { sendTicketEmail } from "../email/send-ticket-email";
import { buildQrToken, newDownloadToken } from "../lib/qr";

/**
 * Issues the ticket for an approved booking (canonical §5 step 5).
 *
 * Idempotent by construction: the ticket id **is** the booking id, so a repeat
 * call overwrites the same document instead of minting a second ticket. That
 * matters because `approveBooking` calls this after its transaction commits —
 * if issuance fails the booking is already approved, and simply approving again
 * repairs it rather than double-claiming inventory.
 *
 * One ticket per booking, admitting `quantity` people. Guide 40's ticket has no
 * per-person split and MVP has no seat assignment, so a party checks in once.
 */
export async function issueTicketForBooking(
  bookingId: string,
): Promise<string> {
  const db = getFirestore();
  const bookingRef = db.collection("bookings").doc(bookingId);
  const booking = (await bookingRef.get()).data();

  if (!booking) {
    throw new Error(`Cannot issue a ticket for missing booking ${bookingId}`);
  }
  if (booking.status !== "approved") {
    throw new Error(`Booking ${bookingId} is not approved`);
  }

  const ticketId = bookingId;
  const ticketRef = db.collection("tickets").doc(ticketId);
  const existing = (await ticketRef.get()).data();
  if (existing?.qrToken) {
    return ticketId;
  }

  const event = (
    await db.collection("events").doc(booking.eventId).get()
  ).data();
  if (!event) {
    throw new Error(`Event ${booking.eventId} vanished before ticket issuance`);
  }

  const qrToken = buildQrToken(ticketId);
  const qrImage = await renderAndStoreQr(ticketId, qrToken);

  const now = FieldValue.serverTimestamp();
  await ticketRef.set({
    id: ticketId,
    bookingId,
    eventId: booking.eventId,
    organizationId: booking.organizationId,
    ownerId: booking.attendeeId,
    ownerEmail: booking.attendeeEmail ?? null,
    ownerName: booking.attendeeName ?? null,
    eventTitle: event.title ?? "",
    eventStartDate: event.startDate ?? null,
    // Denormalised so the wallet can render the door time in the event's own
    // zone. Without it the ticket fell back to UTC while the public event page
    // used the event doc's timezone — a Riyadh attendee was told to arrive at
    // 18:00 for a 21:00 show.
    eventTimezone: event.timezone ?? null,
    ticketTypeId: booking.ticketTypeId,
    ticketTypeName: booking.ticketTypeName,
    quantity: booking.quantity,
    qrToken,
    qrImage,
    status: "active",
    usedAt: null,
    checkedInBy: null,
    emailSentAt: null,
    createdAt: now,
    updatedAt: now,
  });

  await bookingRef.update({ ticketId, updatedAt: now });

  await db.collection("activityLogs").add({
    organizationId: booking.organizationId,
    eventId: booking.eventId,
    actorId: booking.attendeeId,
    action: "generateTicket",
    resourceType: "ticket",
    resourceId: ticketId,
    metadata: { bookingId, quantity: booking.quantity },
    createdAt: now,
  });

  await deliverByEmail(ticketRef.path, {
    booking,
    event,
    qrImage,
  });

  return ticketId;
}

/**
 * Renders the QR to PNG and stores it privately. `error: "H"` survives a
 * cracked phone screen or a bad camera; the white quiet zone is required or
 * scanners fail against a dark background.
 */
async function renderAndStoreQr(
  ticketId: string,
  qrToken: string,
): Promise<string> {
  const png = await toBuffer(qrToken, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 640,
    color: { dark: "#0A0A0BFF", light: "#FFFFFFFF" },
  });

  const bucket = getStorage().bucket();
  const path = `tickets/${ticketId}/qr.png`;
  const downloadToken = newDownloadToken();

  await bucket.file(path).save(png, {
    contentType: "image/png",
    metadata: {
      cacheControl: "private, max-age=31536000",
      metadata: { firebaseStorageDownloadTokens: downloadToken },
    },
  });

  return (
    `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/` +
    `${encodeURIComponent(path)}?alt=media&token=${downloadToken}`
  );
}

/** Email is best effort — a delivery failure never invalidates a valid ticket. */
async function deliverByEmail(
  ticketPath: string,
  context: {
    booking: FirebaseFirestore.DocumentData;
    event: FirebaseFirestore.DocumentData;
    qrImage: string;
  },
): Promise<void> {
  const { booking, event, qrImage } = context;
  const to = booking.attendeeEmail;
  if (!to) {
    return;
  }

  const db = getFirestore();
  // Venues are a root collection referenced by id (canonical §5), so the name
  // has to be resolved rather than read off the event.
  const [organization, venue] = await Promise.all([
    db
      .collection("organizations")
      .doc(booking.organizationId)
      .get()
      .then((snapshot) => snapshot.data()),
    event.venueId
      ? db
          .collection("venues")
          .doc(event.venueId)
          .get()
          .then((snapshot) => snapshot.data())
      : Promise.resolve(undefined),
  ]);

  const sent = await sendTicketEmail({
    to,
    attendeeName: booking.attendeeName ?? null,
    eventTitle: event.title ?? "",
    eventStartsAt:
      event.startDate instanceof Timestamp ? event.startDate.toDate() : null,
    venueName: venue?.name ?? null,
    organizationName: organization?.name ?? "",
    quantity: booking.quantity,
    ticketTypeName: booking.ticketTypeName,
    qrImageUrl: qrImage,
  });

  if (sent) {
    await db
      .doc(ticketPath)
      .update({ emailSentAt: FieldValue.serverTimestamp() });
  } else {
    logger.info("Ticket issued without email delivery", { ticketPath });
  }
}
