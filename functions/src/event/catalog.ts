import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import type { CallableResponse } from "../lib/errors";
import { requireAuth, requireMemberRole } from "../lib/organization-guards";

/**
 * Venues and artists are root collections referenced by id (guide 50 §5), not
 * embedded on the event, so the same venue or lineup can be reused across
 * events and later gets its own public page.
 *
 * Both are created inline from the wizard; each belongs to the organization
 * that created it.
 */

export const createVenue = onCall<
  { organizationId?: string; name?: string; address?: string; city?: string },
  Promise<CallableResponse<{ venueId: string }>>
>(async (request) => {
  const { uid } = requireAuth(request);
  const { organizationId, name, address, city } = request.data ?? {};
  if (!organizationId || !name?.trim() || !address?.trim() || !city?.trim()) {
    throw new HttpsError("invalid-argument", "Missing venue fields.", {
      code: "VALIDATION_ERROR",
    });
  }
  await requireMemberRole(organizationId, uid, ["owner", "manager"]);

  const db = getFirestore();
  const ref = db.collection("venues").doc();
  const now = FieldValue.serverTimestamp();

  await ref.set({
    id: ref.id,
    organizationId,
    name: name.trim().slice(0, 120),
    address: address.trim().slice(0, 300),
    city: city.trim().slice(0, 80),
    createdBy: uid,
    createdAt: now,
    updatedAt: now,
  });

  return {
    success: true,
    message: "Venue created.",
    data: { venueId: ref.id },
  };
});

export const createArtist = onCall<
  { organizationId?: string; name?: string },
  Promise<CallableResponse<{ artistId: string }>>
>(async (request) => {
  const { uid } = requireAuth(request);
  const { organizationId, name } = request.data ?? {};
  if (!organizationId || !name?.trim()) {
    throw new HttpsError("invalid-argument", "Missing artist name.", {
      code: "VALIDATION_ERROR",
    });
  }
  await requireMemberRole(organizationId, uid, ["owner", "manager"]);

  const db = getFirestore();
  const ref = db.collection("artists").doc();
  const now = FieldValue.serverTimestamp();

  await ref.set({
    id: ref.id,
    organizationId,
    name: name.trim().slice(0, 120),
    image: null,
    createdBy: uid,
    createdAt: now,
    updatedAt: now,
  });

  return {
    success: true,
    message: "Artist created.",
    data: { artistId: ref.id },
  };
});
