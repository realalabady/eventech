import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import { requireAdmin, writeAuditLog } from "../lib/admin-guards";
import type { CallableResponse } from "../lib/errors";

const MAX_REASON = 280;

/**
 * Suspending a user is two writes that must agree: the Firestore flag the UI
 * reads, and the Firebase Auth `disabled` bit that actually stops them signing
 * in. Only the second is real security — `accountStatus` alone would leave a
 * suspended user with a live session and a valid token.
 */
export const suspendUser = onCall<
  { userId?: string; reason?: string },
  Promise<CallableResponse>
>(async (request) => {
  const { uid } = requireAdmin(request);
  const { userId, reason } = request.data ?? {};

  if (!userId) {
    throw new HttpsError("invalid-argument", "userId required.", {
      code: "VALIDATION_ERROR",
    });
  }
  // An admin locking themselves out cannot undo it from the product, only from
  // the console — so the product refuses.
  if (userId === uid) {
    throw new HttpsError("invalid-argument", "You cannot suspend yourself.", {
      code: "VALIDATION_ERROR",
    });
  }

  const db = getFirestore();
  const userRef = db.collection("users").doc(userId);
  const user = (await userRef.get()).data();
  if (!user) {
    throw new HttpsError("not-found", "User not found.", { code: "NOT_FOUND" });
  }
  if (user.role === "admin") {
    throw new HttpsError("permission-denied", "Admins cannot be suspended.", {
      code: "PERMISSION_DENIED",
    });
  }

  const cleanReason = reason?.trim().slice(0, MAX_REASON) || null;

  // Auth first: if this fails the user must stay usable rather than end up
  // flagged suspended in the UI while still able to sign in and act.
  await getAuth().updateUser(userId, { disabled: true });
  await userRef.update({
    accountStatus: "suspended",
    suspendedReason: cleanReason,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await writeAuditLog({
    actorId: uid,
    action: "suspendUser",
    resourceType: "user",
    resourceId: userId,
    metadata: { reason: cleanReason },
  });

  return { success: true, message: "User suspended." };
});

export const restoreUser = onCall<
  { userId?: string },
  Promise<CallableResponse>
>(async (request) => {
  const { uid } = requireAdmin(request);
  const userId = request.data?.userId;

  if (!userId) {
    throw new HttpsError("invalid-argument", "userId required.", {
      code: "VALIDATION_ERROR",
    });
  }

  const db = getFirestore();
  const userRef = db.collection("users").doc(userId);
  if (!(await userRef.get()).exists) {
    throw new HttpsError("not-found", "User not found.", { code: "NOT_FOUND" });
  }

  await getAuth().updateUser(userId, { disabled: false });
  await userRef.update({
    accountStatus: "active",
    suspendedReason: null,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await writeAuditLog({
    actorId: uid,
    action: "restoreUser",
    resourceType: "user",
    resourceId: userId,
  });

  return { success: true, message: "User restored." };
});
