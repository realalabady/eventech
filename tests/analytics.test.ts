import { describe, expect, it } from "vitest";

import {
  attendanceRate,
  conversionRate,
  EMPTY_METRICS,
  toDailySeries,
  type EventMetrics,
} from "@/features/analytics/types";

const NOW = new Date(2026, 6, 27, 12, 0, 0).getTime();
const DAY = 86_400_000;

function metrics(overrides: Partial<EventMetrics> = {}): EventMetrics {
  return { ...EMPTY_METRICS, ...overrides };
}

describe("conversionRate", () => {
  it("is approved bookings per view, as a percentage", () => {
    expect(conversionRate(metrics({ views: 200, approved: 10 }))).toBe(5);
  });

  // A page nobody has opened has not converted badly — it is unmeasured.
  // Printing 0% would be a confident claim about nothing.
  it("is undefined rather than zero when nothing has been viewed", () => {
    expect(conversionRate(metrics({ views: 0, approved: 0 }))).toBeNull();
  });
});

describe("attendanceRate", () => {
  it("is the checked-in share of issued tickets", () => {
    expect(attendanceRate(metrics({ approved: 4, attended: 3 }))).toBe(75);
  });

  it("is undefined before any ticket is issued", () => {
    expect(attendanceRate(metrics({ approved: 0, attended: 0 }))).toBeNull();
  });
});

describe("toDailySeries", () => {
  it("returns one point per day in the window", () => {
    expect(toDailySeries([], NOW, 30)).toHaveLength(30);
  });

  it("keeps days with nothing in them, so a quiet week is visible", () => {
    const series = toDailySeries([NOW, NOW - 2 * DAY], NOW, 5);
    expect(series.map((point) => point.bookings)).toEqual([0, 0, 1, 0, 1]);
  });

  it("counts several bookings on one day together", () => {
    const series = toDailySeries([NOW, NOW - 1000, NOW - 2000], NOW, 3);
    expect(series[series.length - 1].bookings).toBe(3);
  });

  it("ends on today", () => {
    const series = toDailySeries([], NOW, 7);
    expect(series[series.length - 1].day).toBe("2026-07-27");
  });

  it("ignores instants outside the window rather than folding them into it", () => {
    const series = toDailySeries([NOW - 90 * DAY], NOW, 7);
    expect(series.every((point) => point.bookings === 0)).toBe(true);
  });
});
