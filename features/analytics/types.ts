import type { BookingStatus } from "@/types/domain";

/**
 * Analytics are **aggregated on read** — canonical §6 specifies
 * `updateDashboardMetrics` as Firestore triggers, which this project
 * structurally cannot use: Firestore is in `me-central2`, Functions cannot run
 * there, and a trigger would depend on cross-region Eventarc delivery
 * (gotcha #8).
 *
 * The alternative was bumping counters inside `approveBooking` and
 * `checkInTicket`. Reading live was chosen because counters drift the moment a
 * write path is missed, and drift in numbers an organizer uses to decide
 * anything is worse than a dashboard that takes an extra moment. Firestore's
 * count aggregation is billed per ~1000 index entries rather than per document,
 * so the usual objection to reading live mostly does not apply here.
 */

export type TierSales = {
  id: string;
  name: string;
  sold: number;
  remaining: number;
};

export type DayPoint = {
  /** `YYYY-MM-DD`, in the viewer's own timezone. */
  day: string;
  bookings: number;
};

export type EventMetrics = {
  views: number;
  bookings: number;
  approved: number;
  attended: number;
  byStatus: Record<BookingStatus, number>;
  tiers: TierSales[];
  daily: DayPoint[];
};

export const EMPTY_METRICS: EventMetrics = {
  views: 0,
  bookings: 0,
  approved: 0,
  attended: 0,
  byStatus: {
    pending_payment: 0,
    pending_review: 0,
    approved: 0,
    rejected: 0,
    expired: 0,
    cancelled: 0,
  },
  tiers: [],
  daily: [],
};

/**
 * Approved bookings per view, as a whole-number percentage.
 *
 * Zero views means the rate is undefined rather than zero — a page nobody has
 * opened has not converted badly, it has not been measured. Returning null lets
 * the tile say so instead of printing a confident 0%.
 */
export function conversionRate(metrics: EventMetrics): number | null {
  if (metrics.views <= 0) return null;
  return Math.round((metrics.approved / metrics.views) * 100);
}

/** Checked-in share of the tickets that were issued. */
export function attendanceRate(metrics: EventMetrics): number | null {
  if (metrics.approved <= 0) return null;
  return Math.round((metrics.attended / metrics.approved) * 100);
}

/**
 * Buckets instants into consecutive days, including the days with nothing in
 * them — a line chart that skips empty days compresses a quiet week into a
 * single step and lies about the shape of demand.
 */
export function toDailySeries(
  instants: number[],
  now = Date.now(),
  windowDays = 30,
): DayPoint[] {
  const counts = new Map<string, number>();
  for (const instant of instants) {
    const key = dayKey(instant);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const series: DayPoint[] = [];
  const start = startOfDay(now) - (windowDays - 1) * 86_400_000;
  for (let index = 0; index < windowDays; index += 1) {
    const key = dayKey(start + index * 86_400_000);
    series.push({ day: key, bookings: counts.get(key) ?? 0 });
  }
  return series;
}

function startOfDay(millis: number): number {
  const date = new Date(millis);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** Local-time day key, so a booking at 1am is not filed under yesterday. */
function dayKey(millis: number): string {
  const date = new Date(millis);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(millis - offset).toISOString().slice(0, 10);
}
