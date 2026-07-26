import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import type { CallableResponse } from "../lib/errors";
import {
  memberDocId,
  requireAuth,
  requireMemberRole,
  type MemberRole,
} from "../lib/organization-guards";

const INVITABLE: MemberRole[] = ["manager", "staff", "scanner"];

/**
 * Invites are in-app in MVP (canonical §7): a pending doc is written and the
 * invitee accepts it on next sign-in. The Resend email lands in Phase 7 without
 * changing this model.
 *
 * Pending invites use an auto-id and carry `userId: null`, because the invitee
 * may not have an account yet. Accepted members use the deterministic
 * `{orgId}_{uid}` id so security rules can resolve membership with one get().
 */
export const inviteMember = onCall<
  { organizationId?: string; email?: string; role?: string; title?: string },
  Promise<CallableResponse>
>(async (request) => {
  const { uid } = requireAuth(request);
  const { organizationId, email, role, title } = request.data ?? {};

  if (!organizationId || !email || !role) {
    throw new HttpsError("invalid-argument", "Missing fields.", {
      code: "VALIDATION_ERROR",
    });
  }
  if (!INVITABLE.includes(role as MemberRole)) {
    throw new HttpsError("invalid-argument", "Role cannot be invited.", {
      code: "VALIDATION_ERROR",
    });
  }
  await requireMemberRole(organizationId, uid, ["owner", "manager"]);

  const normalizedEmail = email.trim().toLowerCase();
  const db = getFirestore();

  const duplicate = await db
    .collection("organizationMembers")
    .where("organizationId", "==", organizationId)
    .where("email", "==", normalizedEmail)
    .limit(1)
    .get();
  if (!duplicate.empty) {
    throw new HttpsError("already-exists", "Already invited or a member.", {
      code: "ALREADY_EXISTS",
    });
  }

  await db.collection("organizationMembers").add({
    organizationId,
    userId: null,
    email: normalizedEmail,
    displayName: null,
    role,
    title: (title ?? "").trim().slice(0, 60) || null,
    status: "invited",
    invitedBy: uid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { success: true, message: "Invitation sent." };
});

/** The invitee accepts. One org per user, so an existing org blocks this. */
export const acceptInvitation = onCall<
  { inviteId?: string },
  Promise<CallableResponse>
>(async (request) => {
  const { uid, email } = requireAuth(request);
  const inviteId = request.data?.inviteId;
  if (!inviteId || !email) {
    throw new HttpsError("invalid-argument", "Missing invite.", {
      code: "VALIDATION_ERROR",
    });
  }

  const db = getFirestore();
  const inviteRef = db.collection("organizationMembers").doc(inviteId);
  const invite = await inviteRef.get();
  const data = invite.data();

  if (!invite.exists || !data || data.status !== "invited") {
    throw new HttpsError("not-found", "Invitation not found.", {
      code: "NOT_FOUND",
    });
  }
  // The invite belongs to the signed-in email, not merely to whoever has the id.
  if (data.email !== email.toLowerCase()) {
    throw new HttpsError(
      "permission-denied",
      "Invitation is for another user.",
      {
        code: "PERMISSION_DENIED",
      },
    );
  }

  const userRef = db.collection("users").doc(uid);
  const existing: string[] =
    (await userRef.get()).data()?.organizationIds ?? [];
  if (existing.length > 0) {
    throw new HttpsError(
      "already-exists",
      "User already has an organization.",
      {
        code: "ALREADY_EXISTS",
      },
    );
  }

  const organizationId = data.organizationId as string;
  const now = FieldValue.serverTimestamp();
  const batch = db.batch();

  batch.set(
    db.collection("organizationMembers").doc(memberDocId(organizationId, uid)),
    {
      organizationId,
      userId: uid,
      email: email.toLowerCase(),
      displayName: (await userRef.get()).data()?.displayName ?? null,
      role: data.role,
      title: data.title ?? null,
      status: "active",
      createdAt: now,
      updatedAt: now,
    },
  );
  batch.delete(inviteRef);
  batch.update(userRef, {
    role: "organizer",
    organizationIds: [organizationId],
    updatedAt: now,
  });
  batch.update(db.collection("organizations").doc(organizationId), {
    memberCount: FieldValue.increment(1),
    updatedAt: now,
  });

  await batch.commit();

  // Anyone who belongs to an organization works inside the workspace, so the
  // account role becomes `organizer`; what they may actually do there is
  // decided by the org-level member role (owner/manager/staff/scanner).
  await getAuth().setCustomUserClaims(uid, {
    role: "organizer",
    organizationId,
  });

  return { success: true, message: "Invitation accepted." };
});

export const updateMemberRole = onCall<
  { organizationId?: string; memberId?: string; role?: string },
  Promise<CallableResponse>
>(async (request) => {
  const { uid } = requireAuth(request);
  const { organizationId, memberId, role } = request.data ?? {};
  if (!organizationId || !memberId || !INVITABLE.includes(role as MemberRole)) {
    throw new HttpsError("invalid-argument", "Invalid request.", {
      code: "VALIDATION_ERROR",
    });
  }
  // Only the owner reshuffles roles, so a manager cannot promote themselves.
  await requireMemberRole(organizationId, uid, ["owner"]);

  const db = getFirestore();
  const memberRef = db.collection("organizationMembers").doc(memberId);
  const member = await memberRef.get();
  if (!member.exists || member.data()?.organizationId !== organizationId) {
    throw new HttpsError("not-found", "Member not found.", {
      code: "NOT_FOUND",
    });
  }
  if (member.data()?.role === "owner") {
    throw new HttpsError("permission-denied", "Owner role cannot change.", {
      code: "PERMISSION_DENIED",
    });
  }

  await memberRef.update({ role, updatedAt: FieldValue.serverTimestamp() });
  return { success: true, message: "Role updated." };
});

export const removeMember = onCall<
  { organizationId?: string; memberId?: string },
  Promise<CallableResponse>
>(async (request) => {
  const { uid } = requireAuth(request);
  const { organizationId, memberId } = request.data ?? {};
  if (!organizationId || !memberId) {
    throw new HttpsError("invalid-argument", "Invalid request.", {
      code: "VALIDATION_ERROR",
    });
  }
  await requireMemberRole(organizationId, uid, ["owner", "manager"]);

  const db = getFirestore();
  const memberRef = db.collection("organizationMembers").doc(memberId);
  const member = await memberRef.get();
  const data = member.data();
  if (!member.exists || !data || data.organizationId !== organizationId) {
    throw new HttpsError("not-found", "Member not found.", {
      code: "NOT_FOUND",
    });
  }
  if (data.role === "owner") {
    throw new HttpsError("permission-denied", "The owner cannot be removed.", {
      code: "PERMISSION_DENIED",
    });
  }

  const now = FieldValue.serverTimestamp();
  const batch = db.batch();
  batch.delete(memberRef);
  if (data.status === "active" && data.userId) {
    // Free the user to join or create another organization.
    batch.update(db.collection("users").doc(data.userId), {
      role: "attendee",
      organizationIds: [],
      updatedAt: now,
    });
    batch.update(db.collection("organizations").doc(organizationId), {
      memberCount: FieldValue.increment(-1),
      updatedAt: now,
    });
  }
  await batch.commit();

  // Revoke workspace access; without this the removed member keeps an
  // organizationId claim until their token happens to expire.
  if (data.status === "active" && data.userId) {
    await getAuth().setCustomUserClaims(data.userId, { role: "attendee" });
  }

  return { success: true, message: "Member removed." };
});
