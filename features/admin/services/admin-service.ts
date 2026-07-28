import { httpsCallable } from "firebase/functions";

import { getFirebaseFunctions } from "@/firebase/client";
import type { AccountRole } from "@/types/domain";

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
