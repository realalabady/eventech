import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import { requireAdmin, writeAuditLog } from "../lib/admin-guards";
import { requireAuth } from "../lib/organization-guards";
import type { CallableResponse } from "../lib/errors";

/** Guide 43's report categories. */
const REPORT_CATEGORIES = [
  "spam",
  "inappropriate",
  "misleading",
  "fraud",
  "other",
] as const;

const REPORT_TARGETS = ["event", "organization"] as const;
const RESOLUTIONS = ["dismissed", "actioned"] as const;

const MAX_DETAIL = 1000;
const MAX_NOTE = 280;
const MAX_FLAG_KEY = 60;

/**
 * Anyone signed in can report content (guide 43's Reports System).
 *
 * Reports are write-only from the client's side: the reporter never reads the
 * queue back, so `reports` is admin-read only and this callable is the sole
 * writer. Storing `reporterId` matters — an anonymous queue cannot be triaged
 * for abuse of the reporting system itself.
 */
export const submitReport = onCall<
  {
    targetType?: string;
    targetId?: string;
    category?: string;
    detail?: string;
  },
  Promise<CallableResponse<{ reportId: string }>>
>(async (request) => {
  const { uid } = requireAuth(request);
  const { targetType, targetId, category, detail } = request.data ?? {};

  if (
    !targetId ||
    !REPORT_TARGETS.includes(targetType as (typeof REPORT_TARGETS)[number]) ||
    !REPORT_CATEGORIES.includes(category as (typeof REPORT_CATEGORIES)[number])
  ) {
    throw new HttpsError("invalid-argument", "Invalid report.", {
      code: "VALIDATION_ERROR",
    });
  }

  const db = getFirestore();
  const collection = targetType === "event" ? "events" : "organizations";
  if (!(await db.collection(collection).doc(targetId).get()).exists) {
    throw new HttpsError("not-found", "Reported item not found.", {
      code: "NOT_FOUND",
    });
  }

  // One open report per person per target: a determined reporter could
  // otherwise bury the queue under duplicates of a single grievance.
  const existing = await db
    .collection("reports")
    .where("reporterId", "==", uid)
    .where("targetId", "==", targetId)
    .where("status", "==", "open")
    .limit(1)
    .get();
  if (!existing.empty) {
    throw new HttpsError("already-exists", "Already reported.", {
      code: "ALREADY_EXISTS",
    });
  }

  const ref = db.collection("reports").doc();
  await ref.set({
    reporterId: uid,
    targetType,
    targetId,
    category,
    detail: detail?.trim().slice(0, MAX_DETAIL) || null,
    status: "open",
    resolution: null,
    resolvedBy: null,
    resolutionNote: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    success: true,
    message: "Report submitted.",
    data: { reportId: ref.id },
  };
});

/** Closes a report (guide 43's report workflow: open → reviewed → resolved). */
export const resolveReport = onCall<
  { reportId?: string; resolution?: string; note?: string },
  Promise<CallableResponse>
>(async (request) => {
  const { uid } = requireAdmin(request);
  const { reportId, resolution, note } = request.data ?? {};

  if (
    !reportId ||
    !RESOLUTIONS.includes(resolution as (typeof RESOLUTIONS)[number])
  ) {
    throw new HttpsError("invalid-argument", "Invalid resolution.", {
      code: "VALIDATION_ERROR",
    });
  }

  const ref = getFirestore().collection("reports").doc(reportId);
  const report = (await ref.get()).data();
  if (!report) {
    throw new HttpsError("not-found", "Report not found.", {
      code: "NOT_FOUND",
    });
  }
  if (report.status === "resolved") {
    throw new HttpsError("failed-precondition", "Report is already closed.", {
      code: "VALIDATION_ERROR",
    });
  }

  await ref.update({
    status: "resolved",
    resolution,
    resolvedBy: uid,
    resolutionNote: note?.trim().slice(0, MAX_NOTE) || null,
    updatedAt: FieldValue.serverTimestamp(),
  });
  await writeAuditLog({
    actorId: uid,
    action: "resolveReport",
    resourceType: "report",
    resourceId: reportId,
    metadata: { resolution },
  });

  return { success: true, message: "Report resolved." };
});

/**
 * Toggles a feature flag.
 *
 * Flags live in one document rather than a document per flag, so a client
 * reads the whole set with a single listener instead of one per feature.
 */
export const setFeatureFlag = onCall<
  { key?: string; enabled?: boolean },
  Promise<CallableResponse>
>(async (request) => {
  const { uid } = requireAdmin(request);
  const { key, enabled } = request.data ?? {};

  // Dots would address a nested field rather than create a flag by that name.
  if (!key?.trim() || key.includes(".") || typeof enabled !== "boolean") {
    throw new HttpsError("invalid-argument", "Invalid flag.", {
      code: "VALIDATION_ERROR",
    });
  }
  const cleanKey = key.trim().slice(0, MAX_FLAG_KEY);

  await getFirestore()
    .collection("featureFlags")
    .doc("flags")
    .set(
      { [cleanKey]: enabled, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );

  await writeAuditLog({
    actorId: uid,
    action: "setFeatureFlag",
    resourceType: "featureFlag",
    resourceId: cleanKey,
    metadata: { enabled },
  });

  return { success: true, message: "Flag updated." };
});

/**
 * Platform limits and defaults (guide 43's Platform Settings).
 *
 * Deliberately a narrow allowlist rather than an arbitrary patch: this document
 * is world-readable, so anything merged into it is published, and an open patch
 * endpoint would let a compromised admin session write anything at all there.
 */
const SETTING_KEYS = ["maxTicketsPerBooking", "supportEmail"] as const;

export const updateSystemSettings = onCall<
  { maxTicketsPerBooking?: number; supportEmail?: string },
  Promise<CallableResponse>
>(async (request) => {
  const { uid } = requireAdmin(request);
  const payload = request.data ?? {};
  const update: Record<string, unknown> = {};

  if (payload.maxTicketsPerBooking !== undefined) {
    const value = Number(payload.maxTicketsPerBooking);
    if (!Number.isInteger(value) || value < 1 || value > 100) {
      throw new HttpsError("invalid-argument", "Invalid ticket limit.", {
        code: "VALIDATION_ERROR",
      });
    }
    update.maxTicketsPerBooking = value;
  }

  if (payload.supportEmail !== undefined) {
    const email = payload.supportEmail.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new HttpsError("invalid-argument", "Invalid support email.", {
        code: "VALIDATION_ERROR",
      });
    }
    update.supportEmail = email;
  }

  if (Object.keys(update).length === 0) {
    throw new HttpsError("invalid-argument", "Nothing to update.", {
      code: "VALIDATION_ERROR",
    });
  }

  update.updatedAt = FieldValue.serverTimestamp();
  await getFirestore()
    .collection("systemSettings")
    .doc("platform")
    .set(update, { merge: true });

  await writeAuditLog({
    actorId: uid,
    action: "updateSystemSettings",
    resourceType: "systemSettings",
    resourceId: "platform",
    metadata: { fields: Object.keys(update).filter((k) => k !== "updatedAt") },
  });

  return { success: true, message: "Settings updated." };
});

export { REPORT_CATEGORIES, SETTING_KEYS };
