import { getFirestore, type Timestamp } from "firebase-admin/firestore";
import { onCall } from "firebase-functions/v2/https";

import { requireAdmin } from "../lib/admin-guards";
import type { CallableResponse } from "../lib/errors";

const PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

export type AuditEntry = {
  id: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, unknown>;
  /** Epoch millis — Timestamps cannot cross the callable boundary. */
  createdAt: number | null;
};

/**
 * Reads the audit trail.
 *
 * This is the one place the app deliberately breaks its own realtime-listener
 * pattern. Canonical §7 makes `auditLogs` **never client-readable**, so the
 * collection stays `allow read: if false` and admins page through it here
 * instead — the rule cannot be relaxed for admins without also making the trail
 * readable to anyone who forges a claim locally.
 *
 * Paged by cursor rather than offset, so a busy trail cannot shift rows between
 * pages. The cursor is the last entry's **document id**, not its timestamp:
 * `createdAt` crosses the wire as epoch millis, and Firestore stores nanosecond
 * precision, so a millisecond cursor rounds down and silently skips every entry
 * written in the sub-millisecond gap. Dropping rows is the one thing an audit
 * log must not do, so this costs one extra read to resolve the cursor document.
 */
export const listAuditLogs = onCall<
  { limit?: number; beforeId?: string | null },
  Promise<CallableResponse<{ entries: AuditEntry[] }>>
>(async (request) => {
  requireAdmin(request);

  const requested = Number(request.data?.limit);
  const size = Number.isFinite(requested)
    ? Math.min(Math.max(1, requested), MAX_PAGE_SIZE)
    : PAGE_SIZE;

  const collection = getFirestore().collection("auditLogs");
  let query = collection.orderBy("createdAt", "desc").limit(size);

  const beforeId = request.data?.beforeId;
  if (beforeId) {
    const cursor = await collection.doc(beforeId).get();
    // A cursor document that has since been removed would otherwise restart the
    // trail from the top and duplicate everything already on screen.
    if (cursor.exists) {
      query = query.startAfter(cursor);
    }
  }

  const snapshot = await query.get();
  const entries: AuditEntry[] = snapshot.docs.map((document) => {
    const data = document.data();
    const createdAt = data.createdAt as Timestamp | null | undefined;
    return {
      id: document.id,
      actorId: data.actorId ?? "",
      action: data.action ?? "",
      resourceType: data.resourceType ?? "",
      resourceId: data.resourceId ?? "",
      metadata: (data.metadata ?? {}) as Record<string, unknown>,
      createdAt: createdAt?.toMillis() ?? null,
    };
  });

  return { success: true, message: "Audit log read.", data: { entries } };
});
