/**
 * Grants the `admin` custom claim to one account.
 *
 * There is a deliberate chicken-and-egg problem in the product: `assignUserRole`
 * requires an existing admin, so the *first* admin cannot be made from the UI.
 * This script is the sanctioned way out, run by someone with project
 * credentials — which is the correct bar for minting a platform administrator.
 *
 *   gcloud auth application-default login
 *   node functions/scripts/grant-admin.mjs someone@example.com
 *
 * It lives inside the functions package rather than a top-level `scripts/`
 * because that is where `firebase-admin` is installed — Node resolves modules
 * from the script's own directory upward, so a root-level copy cannot find it.
 *
 * The claim only reaches the client after the ID token refreshes (gotcha #2),
 * so the account must sign out and back in — or call `getIdToken(true)` —
 * before /admin will let them past the guard.
 */
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID ?? "eventech-2f278";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/grant-admin.mjs <email>");
  process.exit(1);
}

initializeApp({ projectId: PROJECT_ID });

const auth = getAuth();
const user = await auth.getUserByEmail(email).catch(() => null);
if (!user) {
  console.error(`No account found for ${email} in ${PROJECT_ID}.`);
  process.exit(1);
}

// Preserve any existing claims: an organizer promoted to admin keeps the
// organizationId their workspace guards depend on.
await auth.setCustomUserClaims(user.uid, {
  ...(user.customClaims ?? {}),
  role: "admin",
});

// The user document mirrors the claim so the admin console can list roles
// without reading every account's token.
await getFirestore()
  .collection("users")
  .doc(user.uid)
  .set({ role: "admin", updatedAt: new Date() }, { merge: true });

console.log(`Granted admin to ${email} (${user.uid}).`);
console.log("They must sign out and back in for the claim to take effect.");
