import type { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";

import {
  canSuspend,
  compareUsers,
  isKnownAuditAction,
  isSuspended,
  KNOWN_AUDIT_ACTIONS,
  type AdminUser,
} from "@/features/admin/types";
import { ACCOUNT_ROLES } from "@/types/domain";

import ar from "../messages/ar.json";
import en from "../messages/en.json";

function stamp(millis: number): Timestamp {
  return { toMillis: () => millis } as Timestamp;
}

function user(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    id: "u1",
    email: "layla@evntech-test.com",
    displayName: "Layla",
    role: "organizer",
    accountStatus: "active",
    suspendedReason: null,
    createdAt: stamp(0),
    ...overrides,
  };
}

describe("isSuspended", () => {
  it("reports a suspended account", () => {
    expect(isSuspended(user({ accountStatus: "suspended" }))).toBe(true);
  });

  // Accounts created before suspension existed carry no status at all. They are
  // active — treating a missing field as suspended would lock out every early
  // user the moment this shipped.
  it("treats a missing status as active", () => {
    expect(isSuspended(user({ accountStatus: null }))).toBe(false);
  });
});

describe("canSuspend", () => {
  it("allows suspending an ordinary account", () => {
    expect(canSuspend(user(), "admin-1")).toBe(true);
  });

  it("refuses to offer self-suspension", () => {
    expect(canSuspend(user({ id: "admin-1" }), "admin-1")).toBe(false);
  });

  // Mirrors the callable, which refuses outright. Offering a button the server
  // will reject is worse than not offering it.
  it("refuses to offer suspending another admin", () => {
    expect(canSuspend(user({ role: "admin" }), "admin-1")).toBe(false);
  });
});

describe("compareUsers", () => {
  it("surfaces suspended accounts first", () => {
    const ordered = [
      user({ id: "active", displayName: "Aaa" }),
      user({ id: "stopped", displayName: "Zzz", accountStatus: "suspended" }),
    ].sort(compareUsers);

    expect(ordered.map((each) => each.id)).toEqual(["stopped", "active"]);
  });

  it("falls back to name within the same status", () => {
    const ordered = [
      user({ id: "b", displayName: "Zara" }),
      user({ id: "a", displayName: "Amal" }),
    ].sort(compareUsers);

    expect(ordered.map((each) => each.displayName)).toEqual(["Amal", "Zara"]);
  });

  it("orders by email when a display name is missing", () => {
    const ordered = [
      user({ id: "b", displayName: null, email: "zoe@example.com" }),
      user({ id: "a", displayName: null, email: "amal@example.com" }),
    ].sort(compareUsers);

    expect(ordered.map((each) => each.id)).toEqual(["a", "b"]);
  });
});

describe("audit actions", () => {
  it("recognises the actions this build writes", () => {
    for (const action of KNOWN_AUDIT_ACTIONS) {
      expect(isKnownAuditAction(action)).toBe(true);
    }
  });

  // A future phase writing an action this build has no wording for must degrade
  // to the generic sentence rather than leak a raw key into the UI.
  it("does not recognise an action from a future phase", () => {
    expect(isKnownAuditAction("verifyOrganizer")).toBe(false);
  });

  it("translates every known action in both locales", () => {
    for (const action of KNOWN_AUDIT_ACTIONS) {
      expect(en.admin.audit.action).toHaveProperty(action);
      expect(ar.admin.audit.action).toHaveProperty(action);
    }
    expect(en.admin.audit.action).toHaveProperty("unknown");
    expect(ar.admin.audit.action).toHaveProperty("unknown");
  });
});

describe("admin translations", () => {
  it("names every account role in both locales", () => {
    for (const role of ACCOUNT_ROLES) {
      expect(en.admin.role).toHaveProperty(role);
      expect(ar.admin.role).toHaveProperty(role);
    }
  });
});
