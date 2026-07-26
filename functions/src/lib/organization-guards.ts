import { getFirestore } from "firebase-admin/firestore";
import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";

export type MemberRole = "owner" | "manager" | "staff" | "scanner";

export function memberDocId(organizationId: string, userId: string): string {
  return `${organizationId}_${userId}`;
}

export function requireAuth(request: CallableRequest): {
  uid: string;
  email: string | null;
} {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in required.", {
      code: "AUTH_REQUIRED",
    });
  }
  return {
    uid: request.auth.uid,
    email: request.auth.token.email ?? null,
  };
}

/**
 * Confirms the caller is an active member of the organization holding one of
 * `allowed`. Membership is read from Firestore, never from the client payload
 * or from a claim that could be stale (canonical §7).
 */
export async function requireMemberRole(
  organizationId: string,
  userId: string,
  allowed: MemberRole[],
): Promise<MemberRole> {
  const snapshot = await getFirestore()
    .collection("organizationMembers")
    .doc(memberDocId(organizationId, userId))
    .get();

  const data = snapshot.data();
  if (!snapshot.exists || !data || data.status !== "active") {
    throw new HttpsError("permission-denied", "Not a member.", {
      code: "PERMISSION_DENIED",
    });
  }

  const role = data.role as MemberRole;
  if (!allowed.includes(role)) {
    throw new HttpsError("permission-denied", "Insufficient role.", {
      code: "PERMISSION_DENIED",
    });
  }
  return role;
}

/** URL-safe slug, unique across organizations. */
export async function buildUniqueSlug(name: string): Promise<string> {
  const base =
    name
      .toLowerCase()
      .normalize("NFKD")
      // Keep latin letters/digits; Arabic and other scripts collapse to dashes,
      // so fall back to a generated slug when nothing usable survives.
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "org";

  const db = getFirestore();
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const taken = await db
      .collection("organizations")
      .where("slug", "==", candidate)
      .limit(1)
      .get();
    if (taken.empty) {
      return candidate;
    }
  }
  return `${base}-${Date.now().toString(36)}`;
}
