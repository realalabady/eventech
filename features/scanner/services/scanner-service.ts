import { httpsCallable } from "firebase/functions";

import { getFirebaseFunctions } from "@/firebase/client";

/**
 * Check-in is a Cloud Function call, always. The client never reads a ticket to
 * decide whether it is valid — the signature check, the ownership check and the
 * status flip all happen server-side (canonical §6).
 */

export type ScanResult = {
  ticketId: string;
  status: "active" | "used" | "cancelled";
  eventTitle: string;
  ticketTypeName: string;
  ownerName: string | null;
  quantity: number;
  usedAt: number | null;
};

export type ScanOutcome =
  | { ok: true; ticket: ScanResult }
  | { ok: false; errorKey: string; usedAt?: number | null };

const CODE_TO_KEY: Record<string, string> = {
  INVALID_QR: "invalidQr",
  ALREADY_EXISTS: "alreadyCheckedIn",
  PERMISSION_DENIED: "notDoorStaff",
  NOT_FOUND: "invalidQr",
  AUTH_REQUIRED: "authRequired",
  VALIDATION_ERROR: "invalidQr",
};

type ErrorDetails = { code?: string; usedAt?: number | null };

function readDetails(error: unknown): ErrorDetails {
  return typeof error === "object" && error !== null && "details" in error
    ? ((error as { details?: ErrorDetails }).details ?? {})
    : {};
}

async function call(name: string, qrToken: string): Promise<ScanOutcome> {
  try {
    const fn = httpsCallable<{ qrToken: string }, { data?: ScanResult }>(
      getFirebaseFunctions(),
      name,
    );
    const response = await fn({ qrToken });
    const ticket = response.data?.data;
    if (!ticket) {
      return { ok: false, errorKey: "unknown" };
    }
    return { ok: true, ticket };
  } catch (error) {
    const details = readDetails(error);
    return {
      ok: false,
      errorKey: CODE_TO_KEY[details.code ?? ""] ?? "unknown",
      usedAt: details.usedAt ?? null,
    };
  }
}

/** Read-only look-up — does not spend the ticket. */
export function validateTicket(qrToken: string) {
  return call("validateTicket", qrToken);
}

/** Admits the party and records the check-in. */
export function checkInTicket(qrToken: string) {
  return call("checkInTicket", qrToken);
}
