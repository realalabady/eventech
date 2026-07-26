"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { getFirebaseFirestore } from "@/firebase/client";

import type { Organization } from "../types";

type State = {
  organization: Organization | null;
  loading: boolean;
};

type Snapshot = {
  organizationId: string | null;
  organization: Organization | null;
};

/**
 * Realtime organization document for the signed-in user's org.
 * Firestore is the source of truth (canonical §11) — never mirrored into a store.
 *
 * The effect only subscribes; the "nothing to load" cases are derived during
 * render so no state is set synchronously inside the effect body.
 */
export function useOrganization(): State {
  const { status, claims } = useAuth();
  const organizationId = claims?.organizationId ?? null;
  const [snapshot, setSnapshot] = useState<Snapshot>({
    organizationId: null,
    organization: null,
  });

  useEffect(() => {
    if (status !== "authenticated" || !organizationId) {
      return;
    }

    return onSnapshot(
      doc(getFirebaseFirestore(), "organizations", organizationId),
      (document) => {
        setSnapshot({
          organizationId,
          organization: document.exists()
            ? ({ id: document.id, ...document.data() } as Organization)
            : null,
        });
      },
      () => setSnapshot({ organizationId, organization: null }),
    );
  }, [status, organizationId]);

  if (status !== "authenticated" || !organizationId) {
    return { organization: null, loading: status === "loading" };
  }
  // Claims changed but the listener has not reported yet.
  if (snapshot.organizationId !== organizationId) {
    return { organization: null, loading: true };
  }
  return { organization: snapshot.organization, loading: false };
}
