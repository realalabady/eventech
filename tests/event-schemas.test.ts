import { describe, expect, it } from "vitest";

import {
  isFreeEvent,
  totalCapacity,
  type TicketType,
} from "@/features/event/types";
import {
  basicsSchema,
  scheduleSchema,
  ticketTypeSchema,
} from "@/features/event/validation/event-schemas";

import en from "../messages/en.json";

function ticket(price: number, quantity = 10): TicketType {
  return {
    id: "t",
    name: "Standard",
    price,
    currency: "SAR",
    quantity,
    sold: 0,
  };
}

describe("event basics", () => {
  it("rejects an unknown category", () => {
    const result = basicsSchema.safeParse({
      title: "Opening",
      category: "rave",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a canonical category", () => {
    const result = basicsSchema.safeParse({
      title: "Neon Coast Opening",
      category: "rooftopParty",
    });
    expect(result.success).toBe(true);
  });
});

describe("event schedule", () => {
  it("rejects an end that is before the start", () => {
    const result = scheduleSchema.safeParse({
      startDate: "2026-08-14T21:00",
      endDate: "2026-08-14T19:00",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("endBeforeStart");
  });

  it("compares as dates, not strings, across a midnight boundary", () => {
    const result = scheduleSchema.safeParse({
      startDate: "2026-08-14T23:00",
      endDate: "2026-08-15T03:00",
    });
    expect(result.success).toBe(true);
  });
});

describe("ticket types", () => {
  it("allows a free tier at price 0", () => {
    const result = ticketTypeSchema.safeParse({
      name: "Guest list",
      price: 0,
      currency: "sar",
      quantity: 50,
    });
    expect(result.success).toBe(true);
    expect(result.data?.currency).toBe("SAR");
  });

  it("rejects a fractional quantity", () => {
    const result = ticketTypeSchema.safeParse({
      name: "VIP",
      price: 250,
      currency: "SAR",
      quantity: 10.5,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("quantityNotInteger");
  });

  it("rejects a negative price", () => {
    const result = ticketTypeSchema.safeParse({
      name: "VIP",
      price: -1,
      currency: "SAR",
      quantity: 10,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("priceNegative");
  });
});

describe("paid vs free — decides the bank-details gate", () => {
  it("treats an all-zero lineup as free", () => {
    expect(isFreeEvent([ticket(0), ticket(0)])).toBe(true);
  });

  it("treats any priced tier as paid, so publishing needs an IBAN", () => {
    expect(isFreeEvent([ticket(0), ticket(150)])).toBe(false);
  });

  it("sums capacity across tiers", () => {
    expect(totalCapacity([ticket(0, 40), ticket(150, 60)])).toBe(100);
  });
});

describe("i18n coverage", () => {
  it("every schema message key exists in messages/en.json", () => {
    const keys = [
      basicsSchema.safeParse({ title: "x", category: "nope" }),
      ticketTypeSchema.safeParse({
        name: "",
        price: -1,
        currency: "SARS",
        quantity: 0,
      }),
      scheduleSchema.safeParse({ startDate: "", endDate: "" }),
    ]
      .flatMap((result) => result.error?.issues ?? [])
      .map((issue) => issue.message)
      .filter((message) => /^[a-z][A-Za-z]+$/.test(message));

    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      expect(en.event.errors).toHaveProperty(key);
    }
  });
});
