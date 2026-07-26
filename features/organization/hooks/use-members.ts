"use client";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { getFirebaseFirestore } from "@/firebase/client";

import type { OrganizationMember } from "../types";

type Snapshot<TKey> = {
  key: TKey | null;
  items: OrganizationMember[];
};

const EMPTY: OrganizationMember[] = [];

function toMembers(
  docs: { id: string; data: () => Record<string, unknown> }[],
): OrganizationMember[] {
  return docs.map((d) => ({ id: d.id, ...d.data() }) as OrganizationMember);
}

/**
 * Realtime team roster. Effects subscribe only; the empty states are derived
 * during render so nothing sets state synchronously inside the effect body.
 */
export function useMembers(organizationId: string | undefined) {
  const { status } = useAuth();
  const [snapshot, setSnapshot] = useState<Snapshot<string>>({
    key: null,
    items: EMPTY,
  });

  useEffect(() => {
    if (status !== "authenticated" || !organizationId) {
      return;
    }

    const membersQuery = query(
      collection(getFirebaseFirestore(), "organizationMembers"),
      where("organizationId", "==", organizationId),
    );

    return onSnapshot(
      membersQuery,
      (result) =>
        setSnapshot({ key: organizationId, items: toMembers(result.docs) }),
      () => setSnapshot({ key: organizationId, items: EMPTY }),
    );
  }, [status, organizationId]);

  if (status !== "authenticated" || !organizationId) {
    return { members: EMPTY, loading: status === "loading" };
  }
  if (snapshot.key !== organizationId) {
    return { members: EMPTY, loading: true };
  }
  return { members: snapshot.items, loading: false };
}

/**
 * Invitations addressed to the signed-in user's email.
 * The email filter is required — security rules only permit reads of invites
 * matching `request.auth.token.email`.
 */
export function usePendingInvites(): OrganizationMember[] {
  const { status, user } = useAuth();
  const email = user?.email?.toLowerCase() ?? null;
  const [snapshot, setSnapshot] = useState<Snapshot<string>>({
    key: null,
    items: EMPTY,
  });

  useEffect(() => {
    if (status !== "authenticated" || !email) {
      return;
    }

    const invitesQuery = query(
      collection(getFirebaseFirestore(), "organizationMembers"),
      where("email", "==", email),
      where("status", "==", "invited"),
    );

    return onSnapshot(
      invitesQuery,
      (result) => setSnapshot({ key: email, items: toMembers(result.docs) }),
      () => setSnapshot({ key: email, items: EMPTY }),
    );
  }, [status, email]);

  if (status !== "authenticated" || !email || snapshot.key !== email) {
    return EMPTY;
  }
  return snapshot.items;
}
