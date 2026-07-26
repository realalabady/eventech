import { initializeApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions/v2";

initializeApp();

// Gen 2, single region (multi-region ready) — canonical §6.
setGlobalOptions({ region: "europe-west1", maxInstances: 10 });

export { completeOnboarding } from "./auth/complete-onboarding";
export { assignUserRole } from "./auth/assign-user-role";
