import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { httpsCallable } from "firebase/functions";

import {
  getFirebaseAuth,
  getFirebaseFunctions,
  getFirebaseStorage,
} from "@/firebase/client";

import type {
  BrandingValues,
  InviteMemberValues,
  OrganizationProfileValues,
  PaymentValues,
} from "../validation/organization-schemas";

/**
 * Every organization mutation is a Cloud Function call — the client never
 * writes to `organizations` or `organizationMembers` (canonical §7).
 * Errors surface as i18n keys under `organization.errors.*`.
 */

export type OrgResult<T = undefined> =
  { ok: true; data?: T } | { ok: false; errorKey: string };

const CODE_TO_KEY: Record<string, string> = {
  ALREADY_EXISTS: "alreadyExists",
  PERMISSION_DENIED: "permissionDenied",
  VALIDATION_ERROR: "validationFailed",
  NOT_FOUND: "notFound",
  AUTH_REQUIRED: "authRequired",
  RATE_LIMITED: "rateLimited",
};

function toErrorKey(error: unknown): string {
  const details =
    typeof error === "object" && error !== null && "details" in error
      ? (error as { details?: { code?: string } }).details
      : undefined;
  return CODE_TO_KEY[details?.code ?? ""] ?? "unknown";
}

async function call<TPayload extends object, TData = undefined>(
  name: string,
  payload: TPayload,
): Promise<OrgResult<TData>> {
  try {
    const fn = httpsCallable<TPayload, { success: boolean; data?: TData }>(
      getFirebaseFunctions(),
      name,
    );
    const response = await fn(payload);
    return { ok: true, data: response.data?.data };
  } catch (error) {
    return { ok: false, errorKey: toErrorKey(error) };
  }
}

/**
 * Membership changes rewrite custom claims server-side, but the client keeps
 * its old ID token until it is explicitly refreshed. Without this the route
 * guards still see the previous role and bounce the user straight back.
 */
async function refreshClaims(): Promise<void> {
  await getFirebaseAuth().currentUser?.getIdToken(true);
}

export async function createOrganization(payload: {
  name: string;
  description?: string;
}) {
  const result = await call<
    typeof payload,
    { organizationId: string; slug: string }
  >("createOrganization", payload);
  if (result.ok) {
    await refreshClaims();
  }
  return result;
}

export function updateProfile(
  organizationId: string,
  profile: OrganizationProfileValues,
) {
  return call("updateOrganization", { organizationId, profile });
}

export function updateBranding(
  organizationId: string,
  branding: BrandingValues,
) {
  return call("updateOrganization", { organizationId, branding });
}

export function updatePayment(organizationId: string, payment: PaymentValues) {
  return call("updateOrganization", { organizationId, payment });
}

export function inviteMember(
  organizationId: string,
  values: InviteMemberValues,
) {
  return call("inviteMember", { organizationId, ...values });
}

export async function acceptInvitation(inviteId: string) {
  const result = await call("acceptInvitation", { inviteId });
  if (result.ok) {
    await refreshClaims();
  }
  return result;
}

export function updateMemberRole(
  organizationId: string,
  memberId: string,
  role: string,
) {
  return call("updateMemberRole", { organizationId, memberId, role });
}

export function removeMember(organizationId: string, memberId: string) {
  return call("removeMember", { organizationId, memberId });
}

/**
 * Uploads a logo or cover and returns its public URL. Storage rules re-check
 * role, content type and size server-side; this validation is only for fast
 * feedback.
 */
export async function uploadOrganizationImage(
  organizationId: string,
  kind: "logo" | "cover",
  file: File,
): Promise<OrgResult<{ url: string }>> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    return { ok: false, errorKey: "invalidImageType" };
  }
  if (file.size > 20 * 1024 * 1024) {
    return { ok: false, errorKey: "imageTooLarge" };
  }

  const uid = getFirebaseAuth().currentUser?.uid;
  if (!uid) {
    return { ok: false, errorKey: "authRequired" };
  }

  try {
    const extension = file.type.split("/")[1];
    // uid-namespaced so Storage rules verify ownership by path;
    // updateOrganization enforces owner/manager before the URL is stored.
    const storageRef = ref(
      getFirebaseStorage(),
      `organizations/${organizationId}/${kind}/${uid}/${kind}.${extension}`,
    );
    await uploadBytes(storageRef, file, { contentType: file.type });
    const url = await getDownloadURL(storageRef);
    await call("updateOrganization", {
      organizationId,
      branding: { [`${kind}Url`]: url },
    });
    return { ok: true, data: { url } };
  } catch (error) {
    return { ok: false, errorKey: toErrorKey(error) };
  }
}
