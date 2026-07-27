import type { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";

import { walletBucket, type TicketDoc } from "@/features/ticket/types";
import { TICKET_STATUSES } from "@/types/domain";

import { buildToken, readToken } from "../functions/src/lib/qr-token";
import ar from "../messages/ar.json";
import en from "../messages/en.json";

const SECRET = "test-secret";
const NOW = Date.UTC(2026, 6, 27, 12, 0, 0);
const HOUR = 60 * 60 * 1000;

function stamp(millis: number): Timestamp {
  return { toMillis: () => millis } as Timestamp;
}

function ticket(overrides: Partial<TicketDoc> = {}): TicketDoc {
  return {
    id: "t1",
    bookingId: "b1",
    eventId: "e1",
    organizationId: "o1",
    ownerId: "u1",
    ownerName: "Layla",
    eventTitle: "Neon Coast Opening Night",
    eventStartDate: stamp(NOW + HOUR),
    ticketTypeName: "Standard",
    quantity: 2,
    qrToken: "EVT1.t1.sig",
    qrImage: "https://example.test/qr.png",
    status: "active",
    usedAt: null,
    emailSentAt: null,
    createdAt: null,
    ...overrides,
  };
}

describe("qr token", () => {
  it("round-trips a ticket id", () => {
    const token = buildToken("ticket-123", SECRET);
    expect(readToken(token, SECRET)).toBe("ticket-123");
  });

  it("rejects a token signed with a different secret", () => {
    const token = buildToken("ticket-123", SECRET);
    expect(readToken(token, "other-secret")).toBeNull();
  });

  it("rejects a token whose ticket id was swapped after signing", () => {
    const [prefix, , signature] = buildToken("ticket-123", SECRET).split(".");
    expect(readToken(`${prefix}.ticket-456.${signature}`, SECRET)).toBeNull();
  });

  it("rejects malformed input rather than throwing", () => {
    for (const bad of [
      "",
      "not-a-token",
      "EVT1.only-two-parts",
      "EVT9.ticket-123.sig",
      `EVT1.ticket-123.${"x".repeat(600)}`,
      null,
      undefined,
      42,
    ]) {
      expect(readToken(bad, SECRET)).toBeNull();
    }
  });
});

describe("wallet bucketing", () => {
  it("puts a valid ticket for a future event under upcoming", () => {
    expect(walletBucket(ticket(), NOW)).toBe("upcoming");
  });

  it("moves a valid ticket to past once the event has started", () => {
    expect(
      walletBucket(ticket({ eventStartDate: stamp(NOW - HOUR) }), NOW),
    ).toBe("past");
  });

  it("keeps a scanned ticket under used even when the event is still ahead", () => {
    // At the door, "already checked in" is the state the attendee cares about.
    expect(walletBucket(ticket({ status: "used" }), NOW)).toBe("used");
  });

  it("files a void ticket under past", () => {
    expect(walletBucket(ticket({ status: "cancelled" }), NOW)).toBe("past");
  });

  it("treats an undated ticket as upcoming rather than dropping it", () => {
    expect(walletBucket(ticket({ eventStartDate: null }), NOW)).toBe(
      "upcoming",
    );
  });
});

describe("i18n coverage", () => {
  it("every ticket status has a label in both locales", () => {
    for (const status of TICKET_STATUSES) {
      expect(en.ticket.status).toHaveProperty(status);
      expect(ar.ticket.status).toHaveProperty(status);
    }
  });

  it("scanner error keys match across locales", () => {
    expect(Object.keys(ar.scanner.errors).sort()).toEqual(
      Object.keys(en.scanner.errors).sort(),
    );
  });
});
