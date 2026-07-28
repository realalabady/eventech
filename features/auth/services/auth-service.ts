import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";

import { getFirebaseAuth, getFirebaseFunctions } from "@/firebase/client";
import { isFirebaseConfigured } from "@/firebase/config";

import { toAuthErrorKey } from "../lib/auth-errors";
import type { AuthResult } from "../types";

/**
 * Every mutation returns a typed AuthResult instead of throwing, so forms can
 * render a translated message without touching Firebase error codes.
 *
 * Roles and the Firestore user document are NEVER written here — that is
 * `completeOnboarding`, a Cloud Function (canonical §3, §6).
 */

async function run(action: () => Promise<unknown>): Promise<AuthResult> {
  if (!isFirebaseConfigured()) {
    return { ok: false, errorKey: "notConfigured" };
  }
  try {
    await action();
    return { ok: true };
  } catch (error) {
    return { ok: false, errorKey: toAuthErrorKey(error) };
  }
}

/** Creates the Firestore user doc and sets the default `attendee` claim. */
async function completeOnboarding(displayName: string): Promise<void> {
  const callable = httpsCallable<{ displayName: string }, { success: boolean }>(
    getFirebaseFunctions(),
    "completeOnboarding",
  );
  await callable({ displayName });
}

export function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  return run(() =>
    signInWithEmailAndPassword(getFirebaseAuth(), email, password),
  );
}

/**
 * Where a freshly signed-in user belongs. Admins land in the console instead of
 * the organizer workspace: nothing in the workspace links to /admin, so without
 * this they sign in, see the ordinary organizer UI, and have no way to reach it.
 *
 * Reads the claim off the token that sign-in just minted, so it is already
 * current — no forced refresh needed here (unlike after `completeOnboarding`,
 * which writes the claim server-side *after* the token was issued).
 *
 * This is convenience, not authorization. `RequireAdmin` and the callables'
 * `requireAdmin` remain the real boundary (canonical §7).
 */
export async function resolvePostSignInPath(): Promise<string> {
  if (!isFirebaseConfigured()) return "/account";
  const user = getFirebaseAuth().currentUser;
  if (!user) return "/account";
  try {
    const token = await user.getIdTokenResult();
    return token.claims.role === "admin" ? "/admin/users" : "/account";
  } catch {
    // A claim we cannot read is not a reason to block sign-in.
    return "/account";
  }
}

export function registerWithEmail(
  displayName: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  return run(async () => {
    const auth = getFirebaseAuth();
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    await updateProfile(credential.user, { displayName });
    await completeOnboarding(displayName);
    await sendEmailVerification(credential.user);
    // Pick up the role claim the Cloud Function just wrote.
    await credential.user.getIdToken(true);
  });
}

export function signInWithGoogle(): Promise<AuthResult> {
  return run(async () => {
    const auth = getFirebaseAuth();
    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    await completeOnboarding(credential.user.displayName ?? "");
    await credential.user.getIdToken(true);
  });
}

export function sendPasswordReset(email: string): Promise<AuthResult> {
  return run(() => sendPasswordResetEmail(getFirebaseAuth(), email));
}

export function resendVerificationEmail(): Promise<AuthResult> {
  return run(() => {
    const user = getFirebaseAuth().currentUser;
    if (!user) {
      throw new Error("no-current-user");
    }
    return sendEmailVerification(user);
  });
}

export function signOut(): Promise<AuthResult> {
  return run(() => firebaseSignOut(getFirebaseAuth()));
}
