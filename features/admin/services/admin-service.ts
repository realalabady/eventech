import { httpsCallable } from "firebase/functions";

import { getFirebaseFunctions } from "@/firebase/client";
import type { AccountRole } from "@/types/domain";

import type {
  ModerationStatus,
  ReportCategory,
  ReportResolution,
} from "../moderation-types";
import type { AuditEntry } from "../types";

/**
 * Admin mutations are Cloud Function calls. The client never writes `users`
 * role or status, and never reads `auditLogs` directly — both are refused by
 * rules (canonical §7), so the callable is the only route.
 */

export type AdminResult<T = undefined> =
  { ok: true; data?: T } | { ok: false; errorKey: string };

const CODE_TO_KEY: Record<string, string> = {
  PERMISSION_DENIED: "permissionDenied",
  VALIDATION_ERROR: "validationFailed",
  NOT_FOUND: "notFound",
  AUTH_REQUIRED: "authRequired",
  RATE_LIMITED: "rateLimited",
};

async function call<TPayload extends object, TData = undefined>(
  name: string,
  payload: TPayload,
): Promise<AdminResult<TData>> {
  try {
    const fn = httpsCallable<TPayload, { data?: TData }>(
      getFirebaseFunctions(),
      name,
    );
    const response = await fn(payload);
    return { ok: true, data: response.data?.data };
  } catch (error) {
    const details =
      typeof error === "object" && error !== null && "details" in error
        ? (error as { details?: { code?: string } }).details
        : undefined;
    return {
      ok: false,
      errorKey: CODE_TO_KEY[details?.code ?? ""] ?? "unknown",
    };
  }
}

export function suspendUser(userId: string, reason: string | null) {
  return call<{ userId: string; reason: string | null }>("suspendUser", {
    userId,
    reason,
  });
}

export function restoreUser(userId: string) {
  return call<{ userId: string }>("restoreUser", { userId });
}

export function assignUserRole(userId: string, role: AccountRole) {
  return call<{ userId: string; role: AccountRole }>("assignUserRole", {
    userId,
    role,
  });
}

export function listAuditLogs(beforeId: string | null = null, limit = 50) {
  return call<
    { beforeId: string | null; limit: number },
    { entries: AuditEntry[] }
  >("listAuditLogs", { beforeId, limit });
}

// --- Phase 9b: verification and moderation ---

export function verifyOrganizer(organizationId: string, verified: boolean) {
  return call<{ organizationId: string; verified: boolean }>(
    "verifyOrganizer",
    { organizationId, verified },
  );
}

export function suspendOrganization(
  organizationId: string,
  suspended: boolean,
  reason: string | null,
) {
  return call<{
    organizationId: string;
    suspended: boolean;
    reason: string | null;
  }>("suspendOrganization", { organizationId, suspended, reason });
}

export function updateEventStatus(
  eventId: string,
  status: ModerationStatus,
  reason: string | null,
) {
  return call<{ eventId: string; status: string; reason: string | null }>(
    "updateEventStatus",
    { eventId, status, reason },
  );
}

// --- Phase 9c: reports and platform configuration ---

export function submitReport(
  targetType: "event" | "organization",
  targetId: string,
  category: ReportCategory,
  detail: string | null,
) {
  return call<
    {
      targetType: string;
      targetId: string;
      category: string;
      detail: string | null;
    },
    { reportId: string }
  >("submitReport", { targetType, targetId, category, detail });
}

export function resolveReport(
  reportId: string,
  resolution: ReportResolution,
  note: string | null,
) {
  return call<{ reportId: string; resolution: string; note: string | null }>(
    "resolveReport",
    { reportId, resolution, note },
  );
}

export function setFeatureFlag(key: string, enabled: boolean) {
  return call<{ key: string; enabled: boolean }>("setFeatureFlag", {
    key,
    enabled,
  });
}

export function updateSystemSettings(patch: {
  maxTicketsPerBooking?: number;
  supportEmail?: string;
}) {
  return call("updateSystemSettings", patch);
}
