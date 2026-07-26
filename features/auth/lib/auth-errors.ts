/**
 * Firebase auth error codes → i18n keys under `auth.errors.*`.
 * Sign-in failures all collapse to `invalidCredentials` so the form never
 * reveals whether an account exists (account-enumeration defence).
 */
export const AUTH_ERROR_KEYS = [
  "invalidCredentials",
  "emailInUse",
  "weakPassword",
  "tooManyRequests",
  "popupClosed",
  "networkError",
  "notConfigured",
  "unknown",
] as const;

export type AuthErrorKey = (typeof AUTH_ERROR_KEYS)[number];

const FIREBASE_CODE_MAP: Record<string, AuthErrorKey> = {
  "auth/invalid-credential": "invalidCredentials",
  "auth/invalid-email": "invalidCredentials",
  "auth/user-not-found": "invalidCredentials",
  "auth/wrong-password": "invalidCredentials",
  "auth/user-disabled": "invalidCredentials",
  "auth/email-already-in-use": "emailInUse",
  "auth/weak-password": "weakPassword",
  "auth/too-many-requests": "tooManyRequests",
  "auth/popup-closed-by-user": "popupClosed",
  "auth/cancelled-popup-request": "popupClosed",
  "auth/network-request-failed": "networkError",
};

export function toAuthErrorKey(error: unknown): AuthErrorKey {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  return FIREBASE_CODE_MAP[code] ?? "unknown";
}
