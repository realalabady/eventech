import type { MemberRole } from "@/types/domain";

/** Membership doc id is deterministic: `{organizationId}_{userId}`. */
export function memberDocId(organizationId: string, userId: string): string {
  return `${organizationId}_${userId}`;
}

export type MemberStatus = "invited" | "active";

export type OrganizationMember = {
  id: string;
  organizationId: string;
  userId: string | null;
  email: string;
  displayName: string | null;
  role: MemberRole;
  /** Display-only job title. Not a permission (canonical §3). */
  title: string | null;
  status: MemberStatus;
};

export type OrganizationPayment = {
  bankName: string;
  iban: string;
  accountHolder: string;
};

export type OrganizationBranding = {
  primary: string;
  logoUrl: string | null;
  coverUrl: string | null;
};

export type Organization = {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  verified: boolean;
  branding: OrganizationBranding;
  payment: OrganizationPayment | null;
};
