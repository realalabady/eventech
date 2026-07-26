import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import type { CallableResponse } from "../lib/errors";
import {
  buildUniqueSlug,
  memberDocId,
  requireAuth,
} from "../lib/organization-guards";

type Payload = { name?: string; description?: string };

/**
 * Creates an organization and upgrades the caller to `organizer`.
 * This is the "become an organizer" path (canonical §3).
 *
 * One organization per user (canonical §6): a caller who already owns or
 * belongs to one is rejected rather than silently creating a second.
 */
export const createOrganization = onCall<
  Payload,
  Promise<CallableResponse<{ organizationId: string; slug: string }>>
>(async (request) => {
  const { uid } = requireAuth(request);

  const name = (request.data?.name ?? "").trim();
  if (name.length < 2 || name.length > 100) {
    throw new HttpsError("invalid-argument", "Invalid organization name.", {
      code: "VALIDATION_ERROR",
    });
  }
  const description = (request.data?.description ?? "").trim().slice(0, 1000);

  const db = getFirestore();
  const userRef = db.collection("users").doc(uid);
  const userSnapshot = await userRef.get();
  const existing: string[] = userSnapshot.data()?.organizationIds ?? [];
  if (existing.length > 0) {
    throw new HttpsError(
      "already-exists",
      "User already has an organization.",
      {
        code: "ALREADY_EXISTS",
      },
    );
  }

  const slug = await buildUniqueSlug(name);
  const orgRef = db.collection("organizations").doc();
  const now = FieldValue.serverTimestamp();

  const batch = db.batch();
  batch.set(orgRef, {
    id: orgRef.id,
    ownerId: uid,
    name,
    slug,
    description: description || null,
    website: null,
    verified: false,
    branding: { primary: "#3b82f6", logoUrl: null, coverUrl: null },
    // Collected later in settings; publishing a paid event requires it
    // (canonical §8).
    payment: null,
    memberCount: 1,
    eventCount: 0,
    createdAt: now,
    updatedAt: now,
  });

  batch.set(
    db.collection("organizationMembers").doc(memberDocId(orgRef.id, uid)),
    {
      organizationId: orgRef.id,
      userId: uid,
      email: userSnapshot.data()?.email ?? null,
      displayName: userSnapshot.data()?.displayName ?? null,
      role: "owner",
      title: null,
      status: "active",
      createdAt: now,
      updatedAt: now,
    },
  );

  batch.update(userRef, {
    role: "organizer",
    organizationIds: [orgRef.id],
    updatedAt: now,
  });

  batch.set(db.collection("auditLogs").doc(), {
    actorId: uid,
    action: "createOrganization",
    resourceType: "organization",
    resourceId: orgRef.id,
    metadata: { name, slug },
    createdAt: now,
  });

  await batch.commit();

  await getAuth().setCustomUserClaims(uid, {
    role: "organizer",
    organizationId: orgRef.id,
  });

  return {
    success: true,
    message: "Organization created.",
    data: { organizationId: orgRef.id, slug },
  };
});
