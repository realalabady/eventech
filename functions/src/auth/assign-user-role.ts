import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import { requireAdmin, writeAuditLog } from "../lib/admin-guards";
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
    const { uid } = requireAdmin(request);

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

    // `setCustomUserClaims` REPLACES the whole claims object, so the existing
    // ones have to be carried forward. Without this, promoting an organizer
    // drops their `organizationId` claim: `RequireOrganizer` then bounces them
    // to /organizer/new, where `createOrganization` refuses them with
    // ALREADY_EXISTS because they still own one — locked out of their own
    // workspace with no way back through the product.
    const existing = (await getAuth().getUser(userId)).customClaims ?? {};
    await getAuth().setCustomUserClaims(userId, {
      ...existing,
      role,
      ...(organizationId ? { organizationId } : {}),
    });
    await userRef.update({ role, updatedAt: FieldValue.serverTimestamp() });

    await writeAuditLog({
      actorId: uid,
      action: "assignUserRole",
      resourceType: "user",
      resourceId: userId,
      metadata: { role, organizationId: organizationId ?? null },
    });

    return { success: true, message: "Role updated." };
  },
);
