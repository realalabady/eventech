"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { getFirebaseFirestore } from "@/firebase/client";

type OrganizationPayment = {
  bankName: string;
  iban: string;
  accountHolder: string;
};

type PublicOrg = {
  id: string;
  name: string;
  payment: OrganizationPayment | null;
};

/**
 * Transfer details for the organizing org, for the attendee's payment page.
 *
 * Two documents, because they have different audiences. The name comes from
 * `organizations`, which is world-readable. The bank details come from
 * `organizationPayments/{orgId}`, which requires a signed-in reader — they used
 * to sit on the organization document, where the public read rule exposed every
 * IBAN to anyone with the web API key.
 *
 * The payment listener resolving to null is normal, not an error: an
 * organization that has not entered bank details yet has no document there.
 */
export function useOrganizationPublic(
  organizationId: string | undefined,
): PublicOrg | null {
  const [snapshot, setSnapshot] = useState<{
    key: string | null;
    name: string | null;
    payment: OrganizationPayment | null;
  }>({ key: null, name: null, payment: null });

  useEffect(() => {
    if (!organizationId) return;

    const db = getFirebaseFirestore();

    const stopName = onSnapshot(
      doc(db, "organizations", organizationId),
      (document) =>
        setSnapshot((prev) => ({
          ...prev,
          key: organizationId,
          name: document.exists()
            ? ((document.data().name as string) ?? "")
            : null,
        })),
      () =>
        setSnapshot((prev) => ({ ...prev, key: organizationId, name: null })),
    );

    const stopPayment = onSnapshot(
      doc(db, "organizationPayments", organizationId),
      (document) =>
        setSnapshot((prev) => ({
          ...prev,
          key: organizationId,
          payment: document.exists()
            ? (document.data() as OrganizationPayment)
            : null,
        })),
      // Permission denied here means signed out. The page shows the reference
      // number regardless, so failing quiet is correct.
      () =>
        setSnapshot((prev) => ({ ...prev, key: organizationId, payment: null })),
    );

    return () => {
      stopName();
      stopPayment();
    };
  }, [organizationId]);

  if (snapshot.key !== organizationId || snapshot.name === null) return null;

  return {
    id: organizationId,
    name: snapshot.name,
    payment: snapshot.payment,
  };
}
