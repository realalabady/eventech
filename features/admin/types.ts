import type { Timestamp } from "firebase/firestore";

import type { AccountRole } from "@/types/domain";

/**
 * Account status is not one of canonical §4's lifecycles — it is a field on the
 * user document that `firestore.rules` has protected since Phase 2
 * (`protectedUserFieldsUnchanged`). Defined here rather than in
 * `types/domain.ts`, which is reserved for the canonical enums.
 */
export const ACCOUNT_STATUSES = ["active", "suspended"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export type AdminUser = {
  id: string;
  email: string;
  displayName: string | null;
  role: AccountRole;
  /** Absent on accounts created before suspension existed; treated as active. */
  accountStatus: AccountStatus | null;
  suspendedReason: string | null;
  createdAt: Timestamp | null;
};

/** An audit entry as `listAuditLogs` returns it — instants already flattened. */
export type AuditEntry = {
  id: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, unknown>;
  createdAt: number | null;
};

/**
 * Actions with a translated sentence. Anything else renders generically.
 *
 * This must stay in step with every `writeAuditLog` call in `functions/src` —
 * an action missing here degrades to "Recorded an action", which makes the row
 * useless. The 9b/9c entries below were the only ones ever actually fired, so
 * while they were absent *every* real row rendered as the fallback.
 */
export const KNOWN_AUDIT_ACTIONS = [
  // functions/src/auth/assign-user-role.ts
  "assignUserRole",
  // functions/src/admin/manage-users.ts
  "suspendUser",
  "restoreUser",
  // functions/src/admin/moderation.ts
  "verifyOrganizer",
  "suspendOrganization",
  "updateEventStatus",
  // functions/src/admin/platform.ts
  "resolveReport",
  "setFeatureFlag",
  "updateSystemSettings",
] as const;

export function isKnownAuditAction(
  action: string,
): action is (typeof KNOWN_AUDIT_ACTIONS)[number] {
  return (KNOWN_AUDIT_ACTIONS as readonly string[]).includes(action);
}

/** A missing status means the account predates suspension, so it is active. */
export function isSuspended(user: AdminUser): boolean {
  return user.accountStatus === "suspended";
}

/**
 * Admins are excluded from suspension server-side too; surfacing it here keeps
 * the button from offering something the callable will refuse.
 */
export function canSuspend(user: AdminUser, currentUserId: string): boolean {
  return user.role !== "admin" && user.id !== currentUserId;
}

/** Suspended first, then by name so the list opens on what needs attention. */
export function compareUsers(a: AdminUser, b: AdminUser): number {
  const bySuspension = Number(isSuspended(b)) - Number(isSuspended(a));
  if (bySuspension !== 0) return bySuspension;
  return (a.displayName ?? a.email).localeCompare(b.displayName ?? b.email);
}
