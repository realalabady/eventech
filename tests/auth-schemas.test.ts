import { describe, expect, it } from "vitest";

import { toAuthErrorKey } from "@/features/auth/lib/auth-errors";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} from "@/features/auth/validation/auth-schemas";

import en from "../messages/en.json";

describe("auth schemas", () => {
  it("accepts a valid login", () => {
    const result = loginSchema.safeParse({
      email: "layla@studio.com",
      password: "correct horse",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed email with the invalidEmail key", () => {
    const result = loginSchema.safeParse({ email: "nope", password: "x" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("invalidEmail");
  });

  it("enforces Firebase's 8 character password minimum on register", () => {
    const result = registerSchema.safeParse({
      displayName: "Layla Al-Harbi",
      email: "layla@studio.com",
      password: "short",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("passwordTooShort");
  });

  it("trims and rejects a one-character name", () => {
    const result = registerSchema.safeParse({
      displayName: "  L  ",
      email: "layla@studio.com",
      password: "correct horse",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("nameTooShort");
  });

  it("validates the reset form", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.co" }).success).toBe(
      true,
    );
  });

  it("every schema message key exists in messages/en.json", () => {
    const keys = [
      loginSchema.safeParse({ email: "x", password: "" }),
      registerSchema.safeParse({ displayName: "", email: "x", password: "" }),
    ]
      .flatMap((r) => r.error?.issues ?? [])
      .map((issue) => issue.message);

    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      expect(en.auth.errors).toHaveProperty(key);
    }
  });
});

describe("firebase error mapping", () => {
  it("collapses all sign-in failures to invalidCredentials", () => {
    for (const code of [
      "auth/invalid-credential",
      "auth/user-not-found",
      "auth/wrong-password",
    ]) {
      expect(toAuthErrorKey({ code })).toBe("invalidCredentials");
    }
  });

  it("maps a duplicate email", () => {
    expect(toAuthErrorKey({ code: "auth/email-already-in-use" })).toBe(
      "emailInUse",
    );
  });

  it("falls back to unknown for unrecognised input", () => {
    expect(toAuthErrorKey(new Error("boom"))).toBe("unknown");
    expect(toAuthErrorKey(undefined)).toBe("unknown");
  });

  it("every mapped key has translations in both locales", async () => {
    const ar = (await import("../messages/ar.json")).default;
    for (const key of Object.keys(en.auth.errors)) {
      expect(ar.auth.errors).toHaveProperty(key);
    }
  });
});
