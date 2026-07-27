import { describe, expect, it } from "vitest";

import { isCancellable, needsReceipt } from "@/features/booking/types";
import { BOOKING_STATUSES } from "@/types/domain";

import ar from "../messages/ar.json";
import en from "../messages/en.json";

describe("booking status transitions", () => {
  it("lets an attendee withdraw only while the request is still open", () => {
    expect(isCancellable("pending_payment")).toBe(true);
    expect(isCancellable("pending_review")).toBe(true);
    // Approved bookings hold inventory and a ticket — that is a refund path,
    // which the MVP does not have.
    expect(isCancellable("approved")).toBe(false);
    expect(isCancellable("cancelled")).toBe(false);
    expect(isCancellable("expired")).toBe(false);
  });

  it("asks for a receipt before payment and again after a rejection", () => {
    expect(needsReceipt("pending_payment")).toBe(true);
    expect(needsReceipt("rejected")).toBe(true);
    // Already under review or settled: nothing more to upload.
    expect(needsReceipt("pending_review")).toBe(false);
    expect(needsReceipt("approved")).toBe(false);
  });
});

describe("i18n coverage", () => {
  it("every booking status has a label in both locales", () => {
    for (const status of BOOKING_STATUSES) {
      expect(en.booking.status).toHaveProperty(status);
      expect(ar.booking.status).toHaveProperty(status);
    }
  });

  it("booking error keys match across locales", () => {
    expect(Object.keys(ar.booking.errors).sort()).toEqual(
      Object.keys(en.booking.errors).sort(),
    );
  });
});
