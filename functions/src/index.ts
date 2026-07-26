import { initializeApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions/v2";

initializeApp();

// Gen 2, single region (multi-region ready) — canonical §6.
// me-central2 is Dammam, Saudi Arabia: co-located with Firestore so the several
// reads/writes each callable performs stay in-region, and attendee data plus
// organizer bank details remain in-country.
setGlobalOptions({ region: "me-central1", maxInstances: 10 });

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

export { createEvent } from "./event/create-event";
export { saveEventDraft } from "./event/save-event-draft";
export { publishEvent } from "./event/publish-event";
export { createVenue, createArtist } from "./event/catalog";
