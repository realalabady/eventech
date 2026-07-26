import { describe, expect, it } from "vitest";

import { memberDocId } from "@/features/organization/types";
import {
  inviteMemberSchema,
  organizationProfileSchema,
  paymentSchema,
} from "@/features/organization/validation/organization-schemas";

import en from "../messages/en.json";

describe("organization profile", () => {
  it("accepts a name with an empty website", () => {
    const result = organizationProfileSchema.safeParse({
      name: "Neon Coast Productions",
      website: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a bare domain without a scheme", () => {
    const result = organizationProfileSchema.safeParse({
      name: "Neon Coast",
      website: "neoncoast.com",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("invalidUrl");
  });
});

describe("payment details", () => {
  it("strips spaces and upper-cases a valid IBAN", () => {
    const result = paymentSchema.safeParse({
      bankName: "Al Rajhi Bank",
      accountHolder: "Neon Coast Productions",
      iban: "sa03 8000 0000 6080 1016 7519",
    });
    expect(result.success).toBe(true);
    expect(result.data?.iban).toBe("SA0380000000608010167519");
  });

  it("rejects an IBAN that is too short", () => {
    const result = paymentSchema.safeParse({
      bankName: "Al Rajhi Bank",
      accountHolder: "Neon Coast",
      iban: "SA03 8000",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("invalidIban");
  });
});

describe("member invitations", () => {
  it("accepts the three invitable roles", () => {
    for (const role of ["manager", "staff", "scanner"]) {
      const result = inviteMemberSchema.safeParse({
        email: "crew@studio.com",
        role,
      });
      expect(result.success).toBe(true);
    }
  });

  it("refuses to invite an owner — ownership transfers separately", () => {
    const result = inviteMemberSchema.safeParse({
      email: "crew@studio.com",
      role: "owner",
    });
    expect(result.success).toBe(false);
  });
});

describe("member document ids", () => {
  it("is deterministic so security rules can resolve membership in one get", () => {
    expect(memberDocId("org123", "user456")).toBe("org123_user456");
  });
});

describe("i18n coverage", () => {
  it("every schema message key exists in messages/en.json", () => {
    const messages = [
      organizationProfileSchema.safeParse({ name: "", website: "nope" }),
      paymentSchema.safeParse({ bankName: "", accountHolder: "", iban: "x" }),
      inviteMemberSchema.safeParse({ email: "nope", role: "owner" }),
    ]
      .flatMap((result) => result.error?.issues ?? [])
      .map((issue) => issue.message)
      // Enum failures fall back to Zod's own text; only our keys are checked.
      .filter((message) => /^[a-z][A-Za-z]+$/.test(message));

    expect(messages.length).toBeGreaterThan(0);
    for (const key of messages) {
      expect(en.organization.errors).toHaveProperty(key);
    }
  });
});
