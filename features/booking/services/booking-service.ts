import { httpsCallable } from "firebase/functions";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { track } from "@/firebase/analytics";
import {
  getFirebaseAuth,
  getFirebaseFunctions,
  getFirebaseStorage,
} from "@/firebase/client";
import { AnalyticsEvent } from "@/lib/analytics/events";

/**
 * All booking mutations are Cloud Function calls. Status, amount and inventory
 * are decided server-side; the client never writes to `bookings` (canonical §7).
 */

export type BookingResult<T = undefined> =
  { ok: true; data?: T } | { ok: false; errorKey: string };

const CODE_TO_KEY: Record<string, string> = {
  ALREADY_EXISTS: "alreadyBooked",
  PERMISSION_DENIED: "permissionDenied",
  VALIDATION_ERROR: "validationFailed",
  NOT_FOUND: "notFound",
  AUTH_REQUIRED: "authRequired",
  BOOKING_CLOSED: "bookingClosed",
  EVENT_FULL: "soldOut",
  EMAIL_NOT_VERIFIED: "emailNotVerified",
  RATE_LIMITED: "rateLimited",
};

function toErrorKey(error: unknown): string {
  const details =
    typeof error === "object" && error !== null && "details" in error
      ? (error as { details?: { code?: string } }).details
      : undefined;
  return CODE_TO_KEY[details?.code ?? ""] ?? "unknown";
}

async function call<TPayload extends object, TData = undefined>(
  name: string,
  payload: TPayload,
): Promise<BookingResult<TData>> {
  try {
    const fn = httpsCallable<TPayload, { success: boolean; data?: TData }>(
      getFirebaseFunctions(),
      name,
    );
    const response = await fn(payload);
    return { ok: true, data: response.data?.data };
  } catch (error) {
    return { ok: false, errorKey: toErrorKey(error) };
  }
}

export async function createBooking(
  eventId: string,
  ticketTypeId: string,
  quantity: number,
) {
  const result = await call<
    { eventId: string; ticketTypeId: string; quantity: number },
    { bookingId: string }
  >("createBooking", { eventId, ticketTypeId, quantity });
  // Funnel step 5. `quantity` is a count, `eventId` an opaque id — neither
  // identifies the attendee.
  if (result.ok) track(AnalyticsEvent.BOOKING_REQUESTED, { eventId, quantity });
  return result;
}

export async function approveBooking(bookingId: string) {
  const result = await call("approveBooking", { bookingId });
  if (result.ok) track(AnalyticsEvent.BOOKING_APPROVED);
  return result;
}

export async function rejectBooking(bookingId: string, reason: string) {
  const result = await call("rejectBooking", { bookingId, reason });
  // The rejection reason is free text an organizer wrote about a specific
  // person. It stays out of analytics.
  if (result.ok) track(AnalyticsEvent.BOOKING_REJECTED);
  return result;
}

export function cancelBooking(bookingId: string) {
  return call("cancelBooking", { bookingId });
}

/**
 * Uploads the transfer receipt, then records it. Receipts are private in
 * Storage — only the attendee and the reviewing organizers can read them.
 */
export async function uploadReceipt(
  eventId: string,
  bookingId: string,
  file: File,
): Promise<BookingResult> {
  if (!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(file.type)) {
    return { ok: false, errorKey: "invalidReceiptType" };
  }
  if (file.size > 20 * 1024 * 1024) {
    return { ok: false, errorKey: "receiptTooLarge" };
  }

  const uid = getFirebaseAuth().currentUser?.uid;
  if (!uid) {
    return { ok: false, errorKey: "authRequired" };
  }

  try {
    const extension =
      file.type === "application/pdf" ? "pdf" : file.type.split("/")[1];
    // Path is namespaced by uid so Storage rules can verify ownership without
    // reading Firestore; submitReceipt re-checks that it matches the booking.
    const storageRef = ref(
      getFirebaseStorage(),
      `events/${eventId}/receipts/${uid}/${bookingId}.${extension}`,
    );
    await uploadBytes(storageRef, file, { contentType: file.type });
    const receiptUrl = await getDownloadURL(storageRef);
    return call("submitReceipt", { bookingId, receiptUrl });
  } catch (error) {
    // Storage failures (rules, CORS, bucket config) never reach the callable,
    // so log the raw error rather than only the mapped key.
    console.error("receipt upload failed", error);
    return { ok: false, errorKey: toErrorKey(error) };
  }
}
