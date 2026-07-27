import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import type { CallableResponse } from "../lib/errors";
import { requireAuth, requireMemberRole } from "../lib/organization-guards";

/**
 * Canonical §13 rejects guide 45's `conversations` collection: team
 * communication is `channels` + `messages`, both root collections (§5).
 */

/** Creating a channel is structural, so it stays with the people who run the org. */
const CHANNEL_ADMIN_ROLES = ["owner", "manager"] as const;

/** Posting follows the task board's rule — scanners only work the door. */
const POST_ROLES = ["owner", "manager", "staff"] as const;

const MAX_NAME = 60;
const MAX_TOPIC = 160;
const MAX_BODY = 2000;

export const createChannel = onCall<
  {
    organizationId?: string;
    eventId?: string | null;
    name?: string;
    topic?: string | null;
  },
  Promise<CallableResponse<{ channelId: string }>>
>(async (request) => {
  const { uid } = requireAuth(request);
  const { organizationId, name } = request.data ?? {};

  if (!organizationId || !name?.trim()) {
    throw new HttpsError("invalid-argument", "Missing channel fields.", {
      code: "VALIDATION_ERROR",
    });
  }
  await requireMemberRole(organizationId, uid, [...CHANNEL_ADMIN_ROLES]);

  const eventId = request.data?.eventId || null;
  if (eventId) {
    const event = (
      await getFirestore().collection("events").doc(eventId).get()
    ).data();
    if (!event || event.organizationId !== organizationId) {
      throw new HttpsError("not-found", "Event not found.", {
        code: "NOT_FOUND",
      });
    }
  }

  const cleanName = name.trim().slice(0, MAX_NAME);

  // Channel names are how people refer to a conversation out loud, so a
  // duplicate is a usability bug rather than a data one. Cheap to prevent.
  const existing = await getFirestore()
    .collection("channels")
    .where("organizationId", "==", organizationId)
    .where("name", "==", cleanName)
    .limit(1)
    .get();
  if (!existing.empty) {
    throw new HttpsError("already-exists", "Channel name is taken.", {
      code: "ALREADY_EXISTS",
    });
  }

  const now = FieldValue.serverTimestamp();
  const ref = getFirestore().collection("channels").doc();
  await ref.set({
    organizationId,
    eventId,
    name: cleanName,
    topic: request.data?.topic?.trim().slice(0, MAX_TOPIC) || null,
    // Ordering the channel list by activity needs a value from the start, or a
    // channel nobody has posted in yet would sort out of the query entirely.
    lastMessageAt: now,
    createdBy: uid,
    createdAt: now,
    updatedAt: now,
  });

  return {
    success: true,
    message: "Channel created.",
    data: { channelId: ref.id },
  };
});

/**
 * Post to a channel. The message carries the channel's `organizationId` rather
 * than one from the payload, so rules can scope reads without a cross-document
 * lookup and a member of another org cannot address it.
 */
export const sendMessage = onCall<
  { channelId?: string; body?: string },
  Promise<CallableResponse<{ messageId: string }>>
>(async (request) => {
  const { uid } = requireAuth(request);
  const { channelId, body } = request.data ?? {};

  if (!channelId || !body?.trim()) {
    throw new HttpsError("invalid-argument", "Message cannot be empty.", {
      code: "VALIDATION_ERROR",
    });
  }

  const db = getFirestore();
  const channelRef = db.collection("channels").doc(channelId);
  const channel = (await channelRef.get()).data();
  if (!channel) {
    throw new HttpsError("not-found", "Channel not found.", {
      code: "NOT_FOUND",
    });
  }
  await requireMemberRole(channel.organizationId, uid, [...POST_ROLES]);

  const now = FieldValue.serverTimestamp();
  const messageRef = db.collection("messages").doc();

  // The author's name is resolved client-side from the members roster, so
  // nothing here goes stale when somebody renames themselves.
  const batch = db.batch();
  batch.set(messageRef, {
    channelId,
    organizationId: channel.organizationId,
    eventId: channel.eventId ?? null,
    authorId: uid,
    body: body.trim().slice(0, MAX_BODY),
    createdAt: now,
  });
  batch.update(channelRef, { lastMessageAt: now, updatedAt: now });
  await batch.commit();

  return {
    success: true,
    message: "Message sent.",
    data: { messageId: messageRef.id },
  };
});
