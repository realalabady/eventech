import { describe, expect, it } from "vitest";

import {
  DAY_MS,
  SERIES_DAYS,
  deriveMetrics,
  revenueOf,
  topEventsBySales,
  toSeries,
  trendOf,
  upcomingEvents,
  type BookingInput,
  type EventInput,
} from "@/lib/dashboard-metrics";

/** Fixed clock so nothing here depends on when the suite runs. */
const NOW = Date.UTC(2026, 7, 4, 12, 0, 0);
const daysAgo = (n: number) => NOW - n * DAY_MS;

function booking(over: Partial<BookingInput> = {}): BookingInput {
  return {
    status: "approved",
    amount: 100,
    quantity: 1,
    currency: "SAR",
    createdAtMs: daysAgo(1),
    ...over,
  };
}

function event(over: Partial<EventInput> = {}): EventInput {
  return { id: "e1", startDateMs: daysAgo(-1), soldTickets: 0, ...over };
}

describe("toSeries", () => {
  it("returns one bucket per day in the window, oldest first", () => {
    const series = toSeries([daysAgo(0)], NOW);
    expect(series).toHaveLength(SERIES_DAYS);
    expect(series.at(-1)).toBe(1);
    expect(series.slice(0, -1).every((n) => n === 0)).toBe(true);
  });

  it("places older timestamps further left", () => {
    const series = toSeries([daysAgo(13)], NOW);
    expect(series[0]).toBe(1);
  });

  it("drops timestamps outside the window instead of clamping them", () => {
    // Clamping would pile months of history into the first bucket and draw a
    // cliff that never happened.
    expect(toSeries([daysAgo(14)], NOW).every((n) => n === 0)).toBe(true);
    expect(toSeries([daysAgo(400)], NOW).every((n) => n === 0)).toBe(true);
  });

  it("ignores null timestamps rather than counting them as epoch", () => {
    expect(toSeries([null, null], NOW).every((n) => n === 0)).toBe(true);
  });

  it("ignores future timestamps", () => {
    expect(toSeries([daysAgo(-5)], NOW).every((n) => n === 0)).toBe(true);
  });

  it("accumulates several events on the same day", () => {
    const series = toSeries([daysAgo(2), daysAgo(2), daysAgo(2)], NOW);
    expect(series[SERIES_DAYS - 1 - 2]).toBe(3);
  });
});

describe("trendOf", () => {
  it("is null when the prior half is empty", () => {
    // A first-ever booking must not read as "+100%".
    const series = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1];
    expect(trendOf(series)).toBeNull();
  });

  it("is positive when recent activity exceeds prior", () => {
    const series = [1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2];
    expect(trendOf(series)).toBeCloseTo(100);
  });

  it("is negative when activity falls", () => {
    const series = [2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1];
    expect(trendOf(series)).toBeCloseTo(-50);
  });

  it("is zero for flat activity", () => {
    expect(trendOf(new Array(14).fill(1))).toBe(0);
  });
});

describe("revenueOf", () => {
  it("sums only approved bookings", () => {
    const result = revenueOf([
      booking({ status: "approved", amount: 150 }),
      booking({ status: "pending_review", amount: 999 }),
      booking({ status: "rejected", amount: 999 }),
      booking({ status: "cancelled", amount: 999 }),
    ]);
    expect(result.total).toBe(150);
  });

  it("takes the currency from an approved booking, not a rejected one", () => {
    const result = revenueOf([
      booking({ status: "rejected", currency: "USD" }),
      booking({ status: "approved", currency: "AED" }),
    ]);
    expect(result.currency).toBe("AED");
  });

  it("falls back to SAR when nothing is approved", () => {
    expect(revenueOf([booking({ status: "pending_review" })]).currency).toBe(
      "SAR",
    );
    expect(revenueOf([]).total).toBe(0);
  });
});

describe("deriveMetrics", () => {
  const events = [event({ id: "a" }), event({ id: "b" })];
  const bookings = [
    booking({ status: "approved", amount: 100, quantity: 2 }),
    booking({ status: "approved", amount: 50, quantity: 1 }),
    booking({ status: "pending_review", amount: 70, quantity: 4 }),
    booking({ status: "rejected", amount: 999, quantity: 9 }),
  ];
  const tasks = [
    { status: "todo", createdAtMs: daysAgo(1) },
    { status: "in_progress", createdAtMs: daysAgo(1) },
    { status: "done", createdAtMs: daysAgo(1) },
  ];

  const metrics = deriveMetrics(events, bookings, tasks, NOW);
  const byKey = Object.fromEntries(metrics.map((m) => [m.key, m]));

  it("returns every metric key exactly once", () => {
    expect(metrics).toHaveLength(6);
    expect(new Set(metrics.map((m) => m.key)).size).toBe(6);
  });

  it("counts all bookings regardless of status", () => {
    expect(byKey.bookings.value).toBe(4);
  });

  it("counts only pending_review as pending", () => {
    expect(byKey.pending.value).toBe(1);
  });

  it("sums attendees from approved bookings only", () => {
    // 2 + 1 approved. The pending 4 and rejected 9 must not be counted as
    // people who are coming.
    expect(byKey.attendees.value).toBe(3);
  });

  it("sums revenue from approved bookings only", () => {
    expect(byKey.revenue.value).toBe(150);
  });

  it("counts open tasks as everything not done", () => {
    expect(byKey.tasks.value).toBe(2);
  });

  it("gives every metric a full-length series", () => {
    expect(metrics.every((m) => m.series.length === SERIES_DAYS)).toBe(true);
  });
});

describe("upcomingEvents", () => {
  it("returns future events soonest first", () => {
    const list = upcomingEvents(
      [
        event({ id: "later", startDateMs: daysAgo(-10) }),
        event({ id: "soon", startDateMs: daysAgo(-1) }),
      ],
      NOW,
    );
    expect(list.map((e) => e.id)).toEqual(["soon", "later"]);
  });

  it("excludes past events", () => {
    const list = upcomingEvents([event({ id: "past", startDateMs: daysAgo(3) })], NOW);
    expect(list).toHaveLength(0);
  });

  it("excludes events with no date", () => {
    // Guards the null check explicitly: coercing a missing date to 0 would
    // still pass the `>= now` filter the moment anyone reorders these clauses.
    const list = upcomingEvents(
      [event({ id: "undated", startDateMs: null }), event({ id: "real" })],
      NOW,
    );
    expect(list.map((e) => e.id)).toEqual(["real"]);
  });

  it("respects the limit", () => {
    const many = Array.from({ length: 9 }, (_, i) =>
      event({ id: `e${i}`, startDateMs: daysAgo(-(i + 1)) }),
    );
    expect(upcomingEvents(many, NOW)).toHaveLength(5);
  });
});

describe("topEventsBySales", () => {
  it("ranks by tickets sold, descending", () => {
    const list = topEventsBySales([
      event({ id: "low", soldTickets: 5 }),
      event({ id: "high", soldTickets: 50 }),
      event({ id: "mid", soldTickets: 20 }),
    ]);
    expect(list.map((e) => e.id)).toEqual(["high", "mid", "low"]);
  });

  it("excludes events with no sales", () => {
    const list = topEventsBySales([
      event({ id: "none", soldTickets: 0 }),
      event({ id: "some", soldTickets: 1 }),
    ]);
    expect(list.map((e) => e.id)).toEqual(["some"]);
  });
});
