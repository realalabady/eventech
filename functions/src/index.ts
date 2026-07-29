import { initializeApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions/v2";

initializeApp();

// Gen 2, single region (multi-region ready) — canonical §6.
// me-central2 is Dammam, Saudi Arabia: co-located with Firestore so the several
// reads/writes each callable performs stay in-region, and attendee data plus
// organizer bank details remain in-country.
setGlobalOptions({
  region: "me-central1",
  maxInstances: 10,
  // Phase 11 App Check enforcement (canonical §194), behind an env flag rather
  // than hardcoded true. Enforcement rejects every call that arrives without a
  // valid attestation token — so it must not be switched on until a client that
  // sends them is deployed and confirmed, or the live app stops working the
  // moment these functions land. Set APPCHECK_ENFORCE=true in functions/.env
  // once the client is out. See docs/LAUNCH_CHECKLIST.md.
  enforceAppCheck: process.env.APPCHECK_ENFORCE === "true",
});

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

export { createBooking } from "./booking/create-booking";
export { submitReceipt } from "./booking/submit-receipt";
export {
  approveBooking,
  rejectBooking,
  cancelBooking,
} from "./booking/review-booking";

export { validateTicket, checkInTicket } from "./ticket/check-in";

export { createTask, updateTask, deleteTask } from "./task/manage-tasks";
export { setTimelineStage } from "./task/timeline";

export {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "./calendar/manage-calendar";
export { createChannel, sendMessage } from "./messaging/manage-messaging";

export { trackEventView } from "./analytics/track-event-view";

export { suspendUser, restoreUser } from "./admin/manage-users";
export { listAuditLogs } from "./admin/audit";
export {
  verifyOrganizer,
  suspendOrganization,
  updateEventStatus,
} from "./admin/moderation";
export {
  submitReport,
  resolveReport,
  setFeatureFlag,
  updateSystemSettings,
} from "./admin/platform";
