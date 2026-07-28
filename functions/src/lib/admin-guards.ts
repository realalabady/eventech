import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";

/**
 * Admin authorization and the audit trail that every admin action must leave.
 *
 * Account role comes from custom claims rather than a Firestore lookup
 * (canonical §7): `admin` is a platform-wide role with no organization scope,
 * so there is no membership document to consult.
 */

export function requireAdmin(request: CallableRequest): { uid: string } {
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
  return { uid: auth.uid };
}

/**
 * Records an admin action. Guide 43 requires every important one to be logged,
 * and canonical §7 makes `auditLogs` server-write-only and never client-
 * readable — admins read it back through `listAuditLogs`.
 *
 * Fields are `resourceType`/`resourceId`, not guide 43's `targetType`/`targetId`.
 * Canonical §5 fixes the log field names and outranks guide 43, and the entries
 * `createOrganization` and `updateOrganization` have been writing since Phase 3
 * already use them — a second naming in the same collection would render every
 * pre-existing row with a blank target.
 */
export async function writeAuditLog(entry: {
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await getFirestore()
    .collection("auditLogs")
    .add({
      ...entry,
      metadata: entry.metadata ?? {},
      createdAt: FieldValue.serverTimestamp(),
    });
}
