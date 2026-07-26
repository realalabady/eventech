import { z } from "zod";

import { MEMBER_ROLES } from "@/types/domain";

/** Messages are i18n keys resolved under `organization.errors.*`. */

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "nameTooShort" })
    .max(100, { message: "nameTooLong" }),
  description: z
    .string()
    .trim()
    .max(1000, { message: "descriptionTooLong" })
    .optional(),
});

export const organizationProfileSchema = createOrganizationSchema.extend({
  website: z
    .union([z.url({ message: "invalidUrl" }), z.literal("")])
    .optional(),
});

export const brandingSchema = z.object({
  // Hex colour so it can drop straight into a CSS custom property.
  primary: z.string().regex(/^#[0-9a-fA-F]{6}$/, { message: "invalidColor" }),
});

export const paymentSchema = z.object({
  bankName: z
    .string()
    .trim()
    .min(2, { message: "bankNameRequired" })
    .max(100, { message: "bankNameTooLong" }),
  accountHolder: z
    .string()
    .trim()
    .min(2, { message: "accountHolderRequired" })
    .max(100, { message: "accountHolderTooLong" }),
  // Loose IBAN shape: country code + checksum + up to 30 alphanumerics.
  // Deliberately not country-specific; no guide pins a country (guide 50 §5).
  iban: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s+/g, "").toUpperCase())
    .refine((value) => /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(value), {
      message: "invalidIban",
    }),
});

// Owner is assigned at creation and transferred separately, never invited.
const INVITABLE_ROLES = MEMBER_ROLES.filter((role) => role !== "owner");

export const inviteMemberSchema = z.object({
  email: z.email({ message: "invalidEmail" }),
  role: z.enum(INVITABLE_ROLES as [string, ...string[]], {
    message: "invalidRole",
  }),
  title: z.string().trim().max(60, { message: "titleTooLong" }).optional(),
});

export type CreateOrganizationValues = z.infer<typeof createOrganizationSchema>;
export type OrganizationProfileValues = z.infer<
  typeof organizationProfileSchema
>;
export type BrandingValues = z.infer<typeof brandingSchema>;
export type PaymentValues = z.infer<typeof paymentSchema>;
export type InviteMemberValues = z.infer<typeof inviteMemberSchema>;
