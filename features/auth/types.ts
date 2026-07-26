import type { User } from "firebase/auth";

import type { AccountRole } from "@/types/domain";

import type { AuthErrorKey } from "./lib/auth-errors";

/** Custom claims written only by Cloud Functions (canonical §3). */
export type AuthClaims = {
  role: AccountRole;
  organizationId?: string;
};

export type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  /** No NEXT_PUBLIC_FIREBASE_* env vars — project not provisioned yet. */
  | "unconfigured";

export type AuthState = {
  status: AuthStatus;
  user: User | null;
  claims: AuthClaims | null;
};

export type AuthResult = { ok: true } | { ok: false; errorKey: AuthErrorKey };
