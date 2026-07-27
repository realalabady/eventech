import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * QR token format, kept free of Firebase imports so it can be exercised
 * directly by the test suite:
 *
 *   EVT1.<ticketId>.<base64url HMAC-SHA256 of the ticket id>
 *
 * The signature lets `validateTicket` reject a forged or mistyped code before
 * spending a Firestore read, and it means ticket ids cannot be enumerated into
 * working tokens. It is not on its own an admission credential — the caller
 * still compares against the token stored on the ticket.
 */

const PREFIX = "EVT1";
const MAX_TOKEN_LENGTH = 512;

function sign(ticketId: string, secret: string): string {
  return createHmac("sha256", secret).update(ticketId).digest("base64url");
}

export function buildToken(ticketId: string, secret: string): string {
  return `${PREFIX}.${ticketId}.${sign(ticketId, secret)}`;
}

/**
 * The ticket id carried by a token, or null when it is malformed or the
 * signature does not match. The comparison is constant-time so a near-miss
 * cannot be narrowed down by timing.
 */
export function readToken(token: unknown, secret: string): string | null {
  if (typeof token !== "string" || token.length > MAX_TOKEN_LENGTH) {
    return null;
  }
  const parts = token.trim().split(".");
  if (parts.length !== 3 || parts[0] !== PREFIX) {
    return null;
  }
  const [, ticketId, signature] = parts;
  if (!ticketId || !signature) {
    return null;
  }

  const expected = Buffer.from(sign(ticketId, secret));
  const presented = Buffer.from(signature);
  if (expected.length !== presented.length) {
    return null;
  }
  return timingSafeEqual(expected, presented) ? ticketId : null;
}
