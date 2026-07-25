/**
 * Canonical domain enums.
 * Source of truth: guides/50_CANONICAL_DECISIONS.md §4.
 * Do not invent additional statuses — extend the canonical doc first.
 */

export const EVENT_STATUSES = [
  "draft",
  "planning",
  "published",
  "live",
  "completed",
  "cancelled",
  "archived",
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const BOOKING_STATUSES = [
  "pending_payment",
  "pending_review",
  "approved",
  "rejected",
  "expired",
  "cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const TICKET_STATUSES = ["active", "used", "cancelled"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TASK_STATUSES = ["todo", "in_progress", "review", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const MEMBER_ROLES = ["owner", "manager", "staff", "scanner"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

export const ACCOUNT_ROLES = ["attendee", "organizer", "admin"] as const;
export type AccountRole = (typeof ACCOUNT_ROLES)[number];
