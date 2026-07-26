import { z } from "zod";

/**
 * Auth form schemas. Messages are i18n KEYS (resolved under `auth.errors.*`),
 * never user-facing copy — canonical §1.5 forbids hardcoded strings.
 */

const email = z.email({ message: "invalidEmail" });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { message: "passwordRequired" }),
});

export const registerSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, { message: "nameTooShort" })
    .max(80, { message: "nameTooLong" }),
  email,
  // Firebase caps password bytes at 72; 8 is its documented minimum.
  password: z
    .string()
    .min(8, { message: "passwordTooShort" })
    .max(72, { message: "passwordTooLong" }),
});

export const forgotPasswordSchema = z.object({ email });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
