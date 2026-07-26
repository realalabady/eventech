import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import type { CallableResponse } from "../lib/errors";

const ACCOUNT_ROLES = ["attendee", "organizer", "admin"] as const;
type AccountRole = (typeof ACCOUNT_ROLES)[number];

type Payload = { userId?: string; role?: string; organizationId?: string };

/**
 * Admin-only role change. Custom claims are written here and nowhere else
 * (canonical §3, §7) and every change is written to `auditLogs`.
 */
export const assignUserRole = onCall<Payload, Promise<CallableResponse>>(
  async (request) => {
    const auth = request.auth;
    if (!auth) {
      throw new HttpsError("unauthenticated", "Sign in required.", {
        code: "AUTH_REQUIRED",
      });
    }
    if (auth.token.role !== "admin") {
      throw new HttpsError("permission-denied", "Admin role required.", {
        code: "PERMISSION_DENIED",
      });
    }

    const { userId, role, organizationId } = request.data ?? {};
    if (!userId || !ACCOUNT_ROLES.includes(role as AccountRole)) {
      throw new HttpsError("invalid-argument", "Invalid userId or role.", {
        code: "VALIDATION_ERROR",
      });
    }

    const db = getFirestore();
    const userRef = db.collection("users").doc(userId);
    if (!(await userRef.get()).exists) {
      throw new HttpsError("not-found", "User not found.", {
        code: "NOT_FOUND",
      });
    }

    await getAuth().setCustomUserClaims(userId, {
      role,
      ...(organizationId ? { organizationId } : {}),
    });
    await userRef.update({ role, updatedAt: FieldValue.serverTimestamp() });

    await db.collection("auditLogs").add({
      actorId: auth.uid,
      action: "assignUserRole",
      resourceType: "user",
      resourceId: userId,
      metadata: { role, organizationId: organizationId ?? null },
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true, message: "Role updated." };
  },
);
