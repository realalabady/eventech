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
 * Reads the organizing org so the attendee can see where to transfer.
 * Organizations are world-readable (canonical §7), so this works for an
 * attendee who is not a member.
 */
export function useOrganizationPublic(
  organizationId: string | undefined,
): PublicOrg | null {
  const [snapshot, setSnapshot] = useState<{
    key: string | null;
    org: PublicOrg | null;
  }>({ key: null, org: null });

  useEffect(() => {
    if (!organizationId) return;

    return onSnapshot(
      doc(getFirebaseFirestore(), "organizations", organizationId),
      (document) =>
        setSnapshot({
          key: organizationId,
          org: document.exists()
            ? {
                id: document.id,
                name: (document.data().name as string) ?? "",
                payment:
                  (document.data().payment as OrganizationPayment) ?? null,
              }
            : null,
        }),
      () => setSnapshot({ key: organizationId, org: null }),
    );
  }, [organizationId]);

  return snapshot.key === organizationId ? snapshot.org : null;
}
