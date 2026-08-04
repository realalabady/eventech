/**
 * Pure derivation for the organiser dashboard.
 *
 * Kept out of the panel component for two reasons: AGENTS.md requires business
 * logic to live outside UI, and these are the only parts of the dashboard that
 * can silently be *wrong* — a mis-bucketed sparkline or an inverted trend looks
 * plausible on screen. Pure functions make them testable without Firebase.
 *
 * Inputs are structural rather than the feature `Doc` types, so this module has
 * no dependency on any feature and tests need no Firestore `Timestamp`.
 */

export const DAY_MS = 86_400_000;
/** Sparkline window. Two weeks reads as a trend without needing a date axis. */
export const SERIES_DAYS = 14;

export type MetricKey =
  | "events"
  | "bookings"
  | "revenue"
  | "pending"
  | "attendees"
  | "tasks";

export type DashboardMetric = {
  key: MetricKey;
  value: number;
  /** Day-buckets, oldest first. */
  series: number[];
  /** Percent change vs the preceding half-window; null when there is no base. */
  trend: number | null;
};

export type BookingInput = {
  status: string;
  amount: number;
  quantity: number;
  currency: string;
  createdAtMs: number | null;
};

export type EventInput = {
  id: string;
  startDateMs: number | null;
  soldTickets: number;
};

export type TaskInput = {
  status: string;
  createdAtMs: number | null;
};

/**
 * Buckets timestamps into one count per day, oldest first.
 *
 * Timestamps outside the window are dropped rather than clamped into the edge
 * buckets — folding six months of history into day 0 would draw a cliff that
 * never happened.
 */
export function toSeries(times: Array<number | null>, now: number): number[] {
  const buckets = new Array<number>(SERIES_DAYS).fill(0);
  for (const ms of times) {
    if (!ms) continue;
    const age = Math.floor((now - ms) / DAY_MS);
    if (age >= 0 && age < SERIES_DAYS) buckets[SERIES_DAYS - 1 - age] += 1;
  }
  return buckets;
}

/**
 * Percent change of the most recent half of the window against the half before.
 *
 * Returns null when the prior half is empty: "+100%" off a base of zero is an
 * artefact of the first data point, not a trend, and rendering it would tell an
 * organiser their bookings doubled on the day they got their first one.
 */
export function trendOf(series: number[]): number | null {
  const half = Math.floor(series.length / 2);
  const prior = series.slice(0, half).reduce((a, b) => a + b, 0);
  const recent = series.slice(half).reduce((a, b) => a + b, 0);
  if (prior === 0) return null;
  return ((recent - prior) / prior) * 100;
}

/** Total of approved bookings, and the currency they are denominated in. */
export function revenueOf(bookings: BookingInput[]): {
  total: number;
  currency: string;
} {
  const approved = bookings.filter((b) => b.status === "approved");
  return {
    total: approved.reduce((sum, b) => sum + b.amount, 0),
    // An organisation transacts in one currency, so the first approved booking
    // is authoritative. SAR is the fallback only when nothing is approved yet.
    currency: approved[0]?.currency ?? "SAR",
  };
}

export function deriveMetrics(
  events: EventInput[],
  bookings: BookingInput[],
  tasks: TaskInput[],
  now: number,
): DashboardMetric[] {
  const approved = bookings.filter((b) => b.status === "approved");
  const pending = bookings.filter((b) => b.status === "pending_review");

  const bookingSeries = toSeries(
    bookings.map((b) => b.createdAtMs),
    now,
  );
  const approvedSeries = toSeries(
    approved.map((b) => b.createdAtMs),
    now,
  );

  return [
    {
      key: "events",
      value: events.length,
      series: toSeries(
        events.map((e) => e.startDateMs),
        now,
      ),
      trend: null,
    },
    {
      key: "bookings",
      value: bookings.length,
      series: bookingSeries,
      trend: trendOf(bookingSeries),
    },
    {
      key: "revenue",
      value: revenueOf(bookings).total,
      series: approvedSeries,
      trend: trendOf(approvedSeries),
    },
    {
      key: "pending",
      value: pending.length,
      series: toSeries(
        pending.map((b) => b.createdAtMs),
        now,
      ),
      trend: null,
    },
    {
      key: "attendees",
      value: approved.reduce((sum, b) => sum + b.quantity, 0),
      series: approvedSeries,
      trend: trendOf(approvedSeries),
    },
    {
      key: "tasks",
      value: tasks.filter((task) => task.status !== "done").length,
      series: toSeries(
        tasks.map((task) => task.createdAtMs),
        now,
      ),
      trend: null,
    },
  ];
}

/** Future events, soonest first. Events with no date are excluded, not sorted last. */
export function upcomingEvents<T extends EventInput>(
  events: T[],
  now: number,
  limit = 5,
): T[] {
  return events
    .filter((e) => e.startDateMs !== null && e.startDateMs >= now)
    .sort((a, b) => (a.startDateMs ?? 0) - (b.startDateMs ?? 0))
    .slice(0, limit);
}

/** Top events by tickets sold. Events with no sales are excluded. */
export function topEventsBySales<T extends EventInput>(
  events: T[],
  limit = 5,
): T[] {
  return events
    .filter((e) => e.soldTickets > 0)
    .sort((a, b) => b.soldTickets - a.soldTickets)
    .slice(0, limit);
}
