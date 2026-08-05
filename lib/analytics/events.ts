/**
 * The analytics event taxonomy.
 *
 * Every event name the product may emit is declared here. Call sites reference
 * the constant, never a string literal — a typo'd event name does not error,
 * it silently creates a second, near-identical event in the console that nobody
 * notices until a funnel reads wrong months later.
 *
 * Names are snake_case because GA4 requires it (`[a-z][a-z0-9_]*`, ≤40 chars)
 * and silently drops events that violate it.
 *
 * Covers TASK_12's tracking list plus the funnel it asks to measure:
 *   landing → signup → organizer creation → first event → first booking → publish
 */
export const AnalyticsEvent = {
  // Account
  SIGN_UP: "sign_up",
  LOGIN: "login",
  LOGOUT: "logout",
  PROFILE_COMPLETED: "profile_completed",

  // Organizer
  ORGANIZER_REGISTERED: "organizer_registered",
  INVITATION_SENT: "invitation_sent",

  // Events
  EVENT_CREATED: "event_created",
  EVENT_EDITED: "event_edited",
  EVENT_PUBLISHED: "event_published",

  // Booking
  BOOKING_REQUESTED: "booking_requested",
  BOOKING_APPROVED: "booking_approved",
  BOOKING_REJECTED: "booking_rejected",
  RECEIPT_UPLOADED: "receipt_uploaded",

  // Tickets
  QR_GENERATED: "qr_generated",
  QR_SCANNED: "qr_scanned",

  // Production
  TASK_CREATED: "task_created",
  TASK_COMPLETED: "task_completed",

  // Engagement
  NOTIFICATION_OPENED: "notification_opened",
  SEARCH: "search",
  FILTER_USED: "filter_used",
  CALENDAR_USED: "calendar_used",
  KANBAN_USED: "kanban_used",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

/**
 * Allowed parameter values.
 *
 * Deliberately narrow. GA4 accepts arbitrary objects, which is exactly how
 * personal data ends up in an analytics console by accident — a caller passes
 * the whole booking and the attendee's email rides along. Primitives only, and
 * see the identifier rule in `track`.
 */
export type AnalyticsParams = Record<string, string | number | boolean>;
