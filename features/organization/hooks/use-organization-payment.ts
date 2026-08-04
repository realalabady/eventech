"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { getFirebaseFirestore } from "@/firebase/client";

import type { OrganizationPayment } from "../types";

/**
 * Bank details for an organization.
 *
 * Lives in `organizationPayments/{orgId}` rather than on the organization
 * document: `organizations` is world-readable so public organizer pages work
 * without auth, and Firestore cannot hide one field from a public read — the
 * IBAN was therefore exposed to anyone with the web API key.
 *
 * `null` means "not set yet" and is the normal state for a new organization.
 * The listener also resolves to null on permission-denied, which is what a
 * signed-out reader gets.
 */
export function useOrganizationPayment(organizationId: string | undefined) {
  const { status } = useAuth();
  const [state, setState] = useState<{
    key: string | null;
    payment: OrganizationPayment | null;
    loading: boolean;
  }>({ key: null, payment: null, loading: true });

  useEffect(() => {
    if (status !== "authenticated" || !organizationId) return;

    return onSnapshot(
      doc(getFirebaseFirestore(), "organizationPayments", organizationId),
      (document) =>
        setState({
          key: organizationId,
          payment: document.exists()
            ? (document.data() as OrganizationPayment)
            : null,
          loading: false,
        }),
      () => setState({ key: organizationId, payment: null, loading: false }),
    );
  }, [status, organizationId]);

  if (state.key !== organizationId) {
    return { payment: null, loading: Boolean(organizationId) };
  }
  return { payment: state.payment, loading: state.loading };
}
