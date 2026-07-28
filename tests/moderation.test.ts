import type { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";

import {
  canRestore,
  compareOrganizations,
  compareReports,
  isFlagEnabled,
  MODERATION_STATUSES,
  REPORT_CATEGORIES,
  type AdminEvent,
  type AdminOrganization,
  type ReportDoc,
} from "@/features/admin/moderation-types";
import { EVENT_STATUSES } from "@/types/domain";

import ar from "../messages/ar.json";
import en from "../messages/en.json";

const NOW = Date.UTC(2026, 6, 28, 12, 0, 0);

function stamp(millis: number): Timestamp {
  return { toMillis: () => millis } as Timestamp;
}

function org(overrides: Partial<AdminOrganization> = {}): AdminOrganization {
  return {
    id: "o1",
    name: "Neon Coast",
    slug: "neon-coast",
    verified: false,
    suspended: null,
    suspendedReason: null,
    ...overrides,
  };
}

function event(overrides: Partial<AdminEvent> = {}): AdminEvent {
  return {
    id: "e1",
    title: "Opening night",
    slug: "opening-night",
    status: "published",
    organizationId: "o1",
    startDate: stamp(NOW),
    publishedAt: stamp(NOW),
    ...overrides,
  };
}

function report(overrides: Partial<ReportDoc> = {}): ReportDoc {
  return {
    id: "r1",
    reporterId: "u1",
    targetType: "event",
    targetId: "e1",
    category: "spam",
    detail: null,
    status: "open",
    resolution: null,
    resolutionNote: null,
    createdAt: stamp(NOW),
    ...overrides,
  };
}

describe("canRestore", () => {
  it("allows restoring an event that was published before", () => {
    expect(canRestore(event({ status: "cancelled" }))).toBe(true);
  });

  // Restoring a never-published event would push a draft in front of the
  // public without its owner ever pressing publish. The callable refuses it
  // too; this keeps the button from offering it.
  it("refuses an event that was never published", () => {
    expect(canRestore(event({ publishedAt: null }))).toBe(false);
  });

  // How it actually arrives: `useAdminEvents` casts raw Firestore data, and a
  // draft has no `publishedAt` field at all. A strict `!== null` check passed
  // this case and offered "Restore" on a never-published draft in production.
  it("refuses an event whose publishedAt field is absent", () => {
    expect(canRestore(event({ publishedAt: undefined }))).toBe(false);
  });
});

describe("isFlagEnabled", () => {
  it("reads an enabled flag", () => {
    expect(isFlagEnabled({ discoverySearch: true }, "discoverySearch")).toBe(
      true,
    );
  });

  // A feature nobody has switched on is off — never enabled-by-absence.
  it("treats a missing flag as off", () => {
    expect(isFlagEnabled({}, "discoverySearch")).toBe(false);
    expect(isFlagEnabled(null, "discoverySearch")).toBe(false);
  });

  it("does not treat a truthy non-boolean as enabled", () => {
    expect(isFlagEnabled({ discoverySearch: "yes" }, "discoverySearch")).toBe(
      false,
    );
  });
});

describe("compareOrganizations", () => {
  it("puts suspended organizations first", () => {
    const ordered = [
      org({ id: "fine", name: "Aaa" }),
      org({ id: "stopped", name: "Zzz", suspended: true }),
    ].sort(compareOrganizations);
    expect(ordered.map((each) => each.id)).toEqual(["stopped", "fine"]);
  });

  it("puts unverified ahead of verified within the same standing", () => {
    const ordered = [
      org({ id: "done", name: "Aaa", verified: true }),
      org({ id: "todo", name: "Zzz", verified: false }),
    ].sort(compareOrganizations);
    expect(ordered.map((each) => each.id)).toEqual(["todo", "done"]);
  });
});

describe("compareReports", () => {
  it("puts open reports ahead of resolved ones", () => {
    const ordered = [
      report({ id: "closed", status: "resolved" }),
      report({ id: "open", status: "open" }),
    ].sort(compareReports);
    expect(ordered.map((each) => each.id)).toEqual(["open", "closed"]);
  });

  it("orders newest first within the same status", () => {
    const ordered = [
      report({ id: "older", createdAt: stamp(NOW - 1000) }),
      report({ id: "newer", createdAt: stamp(NOW) }),
    ].sort(compareReports);
    expect(ordered.map((each) => each.id)).toEqual(["newer", "older"]);
  });
});

describe("moderation translations", () => {
  it("names every report category in both locales", () => {
    for (const category of REPORT_CATEGORIES) {
      expect(en.admin.reports.category).toHaveProperty(category);
      expect(ar.admin.reports.category).toHaveProperty(category);
    }
  });

  // The badge renders `eventStatus.<status>` for whatever an event carries,
  // not just the three an admin can set, so every status needs wording.
  it("names every event status in both locales", () => {
    for (const status of EVENT_STATUSES) {
      expect(en.admin.eventStatus).toHaveProperty(status);
      expect(ar.admin.eventStatus).toHaveProperty(status);
    }
  });

  it("keeps moderation statuses a subset of the canonical lifecycle", () => {
    for (const status of MODERATION_STATUSES) {
      expect(EVENT_STATUSES).toContain(status);
    }
  });
});
