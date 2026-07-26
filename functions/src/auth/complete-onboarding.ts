import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import type { CallableResponse } from "../lib/errors";

type Payload = { displayName?: string };

/**
 * Creates the Firestore user document and stamps the default `attendee` custom
 * claim after sign-up.
 *
 * This is a callable, NOT a Gen 1 `auth.user().onCreate` trigger: guide 44
 * specified that trigger, but it does not exist in Functions Gen 2, which the
 * project mandates (canonical §3, §6).
 *
 * Idempotent — signing in again with Google must not reset an existing profile
 * or downgrade an organizer/admin back to attendee.
 */
export const completeOnboarding = onCall<Payload, Promise<CallableResponse>>(
  async (request) => {
    const auth = request.auth;
    if (!auth) {
      throw new HttpsError("unauthenticated", "Sign in required.", {
        code: "AUTH_REQUIRED",
      });
    }

    const displayName = (request.data?.displayName ?? "").trim().slice(0, 80);
    const db = getFirestore();
    const userRef = db.collection("users").doc(auth.uid);
    const existing = await userRef.get();

    if (existing.exists) {
      // Never overwrite an established profile or its role.
      return { success: true, message: "Profile already exists." };
    }

    await userRef.set({
      uid: auth.uid,
      email: auth.token.email ?? null,
      displayName: displayName || (auth.token.name ?? null),
      avatar: auth.token.picture ?? null,
      role: "attendee",
      accountStatus: "active",
      emailVerified: auth.token.email_verified === true,
      onboardingCompleted: true,
      organizationIds: [],
      preferences: { theme: "dark", language: "en" },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Only set the claim when absent, so an admin-assigned role is never lost.
    const user = await getAuth().getUser(auth.uid);
    if (!user.customClaims?.role) {
      await getAuth().setCustomUserClaims(auth.uid, { role: "attendee" });
    }

    return { success: true, message: "Profile created." };
  },
);
