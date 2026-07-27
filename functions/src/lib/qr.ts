import { randomBytes } from "node:crypto";

import { defineSecret } from "firebase-functions/params";

import { buildToken, readToken } from "./qr-token";

/**
 * Secret-bound wrappers around the pure token codec in `qr-token.ts`
 * (canonical §5: `qrToken` signed, plus `qrImage`).
 *
 * Set the secret before deploying:
 *   firebase functions:secrets:set TICKET_QR_SECRET --project eventech-2f278
 */
export const TICKET_QR_SECRET = defineSecret("TICKET_QR_SECRET");

export function buildQrToken(ticketId: string): string {
  return buildToken(ticketId, TICKET_QR_SECRET.value());
}

export function readQrToken(token: unknown): string | null {
  return readToken(token, TICKET_QR_SECRET.value());
}

/**
 * Storage download token, the same mechanism receipts use. Firebase's tokenised
 * URLs bypass Storage rules, so the URL itself is the credential — it lives on
 * the ticket document, which only the owner and the event's organizers can read.
 */
export function newDownloadToken(): string {
  return randomBytes(16).toString("hex");
}
