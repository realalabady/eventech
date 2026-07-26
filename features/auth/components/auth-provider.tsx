"use client";

import { onIdTokenChanged } from "firebase/auth";
import { createContext, useEffect, useMemo, useState } from "react";

import { getFirebaseAuth } from "@/firebase/client";
import { isFirebaseConfigured } from "@/firebase/config";
import { ACCOUNT_ROLES, type AccountRole } from "@/types/domain";

import type { AuthState } from "../types";

export const AuthContext = createContext<AuthState>({
  status: "loading",
  user: null,
  claims: null,
});

function toRole(value: unknown): AccountRole {
  return ACCOUNT_ROLES.includes(value as AccountRole)
    ? (value as AccountRole)
    : "attendee";
}

/**
 * Subscribes to Firebase ID-token changes so role claims stay current after
 * `completeOnboarding` or an admin role change. Claims are read from the token,
 * never from Firestore or client state (canonical §3, §7).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: isFirebaseConfigured() ? "loading" : "unconfigured",
    user: null,
    claims: null,
  });

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    return onIdTokenChanged(getFirebaseAuth(), async (user) => {
      if (!user) {
        setState({ status: "unauthenticated", user: null, claims: null });
        return;
      }

      const token = await user.getIdTokenResult();
      setState({
        status: "authenticated",
        user,
        claims: {
          role: toRole(token.claims.role),
          organizationId:
            typeof token.claims.organizationId === "string"
              ? token.claims.organizationId
              : undefined,
        },
      });
    });
  }, []);

  const value = useMemo(() => state, [state]);

  return <AuthContext value={value}>{children}</AuthContext>;
}
