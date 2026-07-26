import { initializeApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions/v2";

initializeApp();

// Gen 2, single region (multi-region ready) — canonical §6.
setGlobalOptions({ region: "europe-west1", maxInstances: 10 });

export { completeOnboarding } from "./auth/complete-onboarding";
export { assignUserRole } from "./auth/assign-user-role";

export { createOrganization } from "./organization/create-organization";
export { updateOrganization } from "./organization/update-organization";
export {
  inviteMember,
  acceptInvitation,
  updateMemberRole,
  removeMember,
} from "./organization/manage-members";
