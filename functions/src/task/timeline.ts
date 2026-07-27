import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import type { CallableResponse } from "../lib/errors";
import { requireAuth, requireMemberRole } from "../lib/organization-guards";

/**
 * Marks a production milestone done or undone.
 *
 * Milestones are seeded by `createEvent` and are never created or deleted from
 * the client — only their `completed` flag moves, which is why this is a single
 * narrow callable rather than a general timeline writer.
 *
 * Note the stage vocabulary is the seeded one (planning / venue / artists /
 * production / marketing / published), not guide 41's Idea→Execution list:
 * those documents already exist in the database and renaming would orphan them.
 */
export const setTimelineStage = onCall<
  { stageId?: string; completed?: boolean },
  Promise<CallableResponse>
>(async (request) => {
  const { uid } = requireAuth(request);
  const { stageId, completed } = request.data ?? {};

  if (!stageId || typeof completed !== "boolean") {
    throw new HttpsError(
      "invalid-argument",
      "stageId and completed required.",
      {
        code: "VALIDATION_ERROR",
      },
    );
  }

  const db = getFirestore();
  const ref = db.collection("timeline").doc(stageId);
  const stage = (await ref.get()).data();
  if (!stage) {
    throw new HttpsError("not-found", "Milestone not found.", {
      code: "NOT_FOUND",
    });
  }
  await requireMemberRole(stage.organizationId, uid, [
    "owner",
    "manager",
    "staff",
  ]);

  const now = FieldValue.serverTimestamp();
  await ref.update({
    completed,
    completedAt: completed ? now : null,
    updatedAt: now,
  });

  await db.collection("activityLogs").add({
    organizationId: stage.organizationId,
    eventId: stage.eventId,
    actorId: uid,
    action: completed ? "completeMilestone" : "reopenMilestone",
    resourceType: "timeline",
    resourceId: stageId,
    metadata: { stage: stage.stage },
    createdAt: now,
  });

  return { success: true, message: "Milestone updated." };
});
