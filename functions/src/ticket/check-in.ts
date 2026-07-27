import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import type { CallableResponse } from "../lib/errors";
import { requireAuth, requireMemberRole } from "../lib/organization-guards";
import { readQrToken, TICKET_QR_SECRET } from "../lib/qr";

/** Anyone working the door. `scanner` exists precisely for this (canonical §3). */
const DOOR_ROLES = ["owner", "manager", "staff", "scanner"] as const;

export type ScanResult = {
  ticketId: string;
  status: "active" | "used" | "cancelled";
  eventTitle: string;
  ticketTypeName: string;
  ownerName: string | null;
  quantity: number;
  /** Set when the ticket had already been used before this scan. */
  usedAt: number | null;
};

/**
 * Resolves a scanned token to a ticket the caller is allowed to see.
 *
 * The signature is checked first so a random QR code from a sticker on the wall
 * costs no Firestore reads, then the stored token is compared as well — a valid
 * signature over a real id is not on its own an admission credential.
 */
async function resolveScan(
  qrToken: unknown,
  uid: string,
): Promise<{
  ref: FirebaseFirestore.DocumentReference;
  data: FirebaseFirestore.DocumentData;
}> {
  const ticketId = readQrToken(qrToken);
  if (!ticketId) {
    throw new HttpsError("invalid-argument", "This code is not a ticket.", {
      code: "INVALID_QR",
    });
  }

  const ref = getFirestore().collection("tickets").doc(ticketId);
  const data = (await ref.get()).data();
  if (!data || data.qrToken !== qrToken) {
    throw new HttpsError("not-found", "This code is not a ticket.", {
      code: "INVALID_QR",
    });
  }

  await requireMemberRole(data.organizationId, uid, [...DOOR_ROLES]);
  return { ref, data };
}

function toScanResult(
  data: FirebaseFirestore.DocumentData,
  ticketId: string,
): ScanResult {
  return {
    ticketId,
    status: data.status,
    eventTitle: data.eventTitle ?? "",
    ticketTypeName: data.ticketTypeName ?? "",
    ownerName: data.ownerName ?? null,
    quantity: data.quantity ?? 1,
    usedAt: data.usedAt ? data.usedAt.toMillis() : null,
  };
}

/**
 * Read-only look-up. Kept separate from `checkInTicket` (canonical §6) so door
 * staff can inspect a ticket — or a scanner can auto-preview — without spending
 * it. Nothing here mutates the ticket.
 */
export const validateTicket = onCall<
  { qrToken?: string },
  Promise<CallableResponse<ScanResult>>
>({ secrets: [TICKET_QR_SECRET] }, async (request) => {
  const { uid } = requireAuth(request);
  const { ref, data } = await resolveScan(request.data?.qrToken, uid);

  return {
    success: true,
    message: "Ticket found.",
    data: toScanResult(data, ref.id),
  };
});

/**
 * Spends the ticket. The status flip and the `checkins` record happen in one
 * transaction, so two doors scanning the same QR at the same moment cannot both
 * admit it — the second gets ALREADY_EXISTS with the original check-in time.
 */
export const checkInTicket = onCall<
  { qrToken?: string },
  Promise<CallableResponse<ScanResult>>
>({ secrets: [TICKET_QR_SECRET] }, async (request) => {
  const { uid } = requireAuth(request);
  const { ref } = await resolveScan(request.data?.qrToken, uid);

  const db = getFirestore();
  const result = await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    const ticket = snapshot.data();
    if (!ticket) {
      throw new HttpsError("not-found", "Ticket not found.", {
        code: "NOT_FOUND",
      });
    }
    if (ticket.status === "cancelled") {
      throw new HttpsError("failed-precondition", "This ticket is void.", {
        code: "INVALID_QR",
      });
    }
    if (ticket.status === "used") {
      throw new HttpsError("already-exists", "Already checked in.", {
        code: "ALREADY_EXISTS",
        usedAt: ticket.usedAt ? ticket.usedAt.toMillis() : null,
      });
    }

    const now = FieldValue.serverTimestamp();
    tx.update(ref, {
      status: "used",
      usedAt: now,
      checkedInBy: uid,
      updatedAt: now,
    });

    tx.set(db.collection("checkins").doc(), {
      ticketId: ref.id,
      bookingId: ticket.bookingId,
      eventId: ticket.eventId,
      organizationId: ticket.organizationId,
      attendeeId: ticket.ownerId,
      quantity: ticket.quantity ?? 1,
      scannerId: uid,
      createdAt: now,
    });

    tx.set(db.collection("activityLogs").doc(), {
      organizationId: ticket.organizationId,
      eventId: ticket.eventId,
      actorId: uid,
      action: "checkInTicket",
      resourceType: "ticket",
      resourceId: ref.id,
      metadata: { quantity: ticket.quantity ?? 1 },
      createdAt: now,
    });

    return toScanResult({ ...ticket, status: "used" }, ref.id);
  });

  return { success: true, message: "Checked in.", data: result };
});
