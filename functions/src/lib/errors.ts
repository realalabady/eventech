/**
 * Canonical error codes (guides/50_CANONICAL_DECISIONS.md §6).
 * Callables throw HttpsError; the `code` below travels in `details` so clients
 * can map to a translated message without parsing prose.
 */
export const ERROR_CODES = [
  "AUTH_REQUIRED",
  "PERMISSION_DENIED",
  "INVALID_REQUEST",
  "VALIDATION_ERROR",
  "NOT_FOUND",
  "BOOKING_CLOSED",
  "EVENT_FULL",
  "ALREADY_EXISTS",
  "INVALID_QR",
  "RATE_LIMITED",
  "SERVER_ERROR",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export type CallableResponse<T = undefined> = {
  success: boolean;
  message: string;
  code?: ErrorCode;
  data?: T;
};
