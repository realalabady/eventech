import type { Timestamp } from "firebase/firestore";

import type { EventStatus } from "@/types/domain";

/**
 * Statuses an admin may move an event to. Narrower than `EventStatus` on
 * purpose: moderation takes things down, and flipping an event to `live` or
 * `completed` would drive an organizer's lifecycle from the outside.
 * `published` exists only so a takedown can be undone.
 */
export const MODERATION_STATUSES = [
  "published",
  "cancelled",
  "archived",
] as const;
export type ModerationStatus = (typeof MODERATION_STATUSES)[number];

export type AdminOrganization = {
  id: string;
  name: string;
  slug: string;
  verified: boolean;
  suspended: boolean | null;
  suspendedReason: string | null;
};

export type AdminEvent = {
  id: string;
  title: string;
  slug: string | null;
  status: EventStatus;
  organizationId: string;
  startDate: Timestamp | null;
  publishedAt: Timestamp | null;
};

export const REPORT_CATEGORIES = [
  "spam",
  "inappropriate",
  "misleading",
  "fraud",
  "other",
] as const;
export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const REPORT_RESOLUTIONS = ["dismissed", "actioned"] as const;
export type ReportResolution = (typeof REPORT_RESOLUTIONS)[number];

export type ReportDoc = {
  id: string;
  reporterId: string;
  targetType: "event" | "organization";
  targetId: string;
  category: ReportCategory;
  detail: string | null;
  status: "open" | "resolved";
  resolution: ReportResolution | null;
  resolutionNote: string | null;
  createdAt: Timestamp | null;
};

/** A missing flag is off: a feature nobody has enabled is not enabled. */
export function isFlagEnabled(
  flags: Record<string, unknown> | null,
  key: string,
): boolean {
  return flags?.[key] === true;
}

/** Only an event that was published once can be restored to published. */
export function canRestore(event: AdminEvent): boolean {
  return event.publishedAt !== null;
}

/** Open reports first, then newest — the queue should open on live work. */
export function compareReports(a: ReportDoc, b: ReportDoc): number {
  const byStatus =
    Number(a.status === "resolved") - Number(b.status === "resolved");
  if (byStatus !== 0) return byStatus;
  return (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0);
}

/** Suspended organizations first, then unverified — both want attention. */
export function compareOrganizations(
  a: AdminOrganization,
  b: AdminOrganization,
): number {
  const bySuspension =
    Number(b.suspended === true) - Number(a.suspended === true);
  if (bySuspension !== 0) return bySuspension;
  const byVerification = Number(a.verified) - Number(b.verified);
  if (byVerification !== 0) return byVerification;
  return a.name.localeCompare(b.name);
}
