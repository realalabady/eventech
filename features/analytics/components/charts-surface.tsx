"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useId } from "react";

import type { DayPoint, TierSales } from "../types";

/**
 * The Recharts instance itself, isolated in its own module.
 *
 * Nothing imports this directly — `analytics-charts.tsx` pulls it in through
 * `next/dynamic`, because canonical §11 requires Recharts to be lazy-loaded and
 * the workspace has a 250KB initial budget to keep.
 *
 * Every colour is read from a design token at render rather than written as a
 * literal, so the charts follow the theme like everything else.
 */

const AXIS = {
  stroke: "var(--muted-foreground)",
  fontSize: 12,
} as const;

const TOOLTIP_STYLE = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  color: "var(--popover-foreground)",
  fontSize: "0.8125rem",
} as const;

/** Charts animate once (canonical §9) — no re-run on hover or data echo. */
// 350ms is TASK_01's `slow` token. The previous 600ms broke the 500ms ceiling,
// and a chart that is still drawing after half a second reads as slow data
// rather than as motion.
const ANIMATION = { isAnimationActive: true, animationDuration: 350 } as const;

export function BookingsOverTime({
  data,
  label,
}: {
  data: DayPoint[];
  label: string;
}) {
  // A fixed id would collide the moment a second chart shares the page — two
  // gradients under one id, and every `url(#…)` resolves to whichever node the
  // document happens to reach first.
  //
  // React decorates generated ids with delimiters that have varied across
  // versions (`:r0:` before 19, `«r0»` after), and this is interpolated into a
  // `url(#…)` reference, so everything outside a safe fragment alphabet goes.
  const gradientId = `bookings-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--hairline)" vertical={false} />
        <XAxis
          dataKey="day"
          {...AXIS}
          tickLine={false}
          axisLine={false}
          // 30 daily labels do not fit; show roughly one per week.
          interval={6}
          tickFormatter={(day: string) => day.slice(5)}
        />
        <YAxis
          {...AXIS}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={false} />
        <Area
          type="monotone"
          dataKey="bookings"
          name={label}
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          {...ANIMATION}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SalesByTier({
  data,
  soldLabel,
}: {
  data: TierSales[];
  soldLabel: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid stroke="var(--hairline)" vertical={false} />
        <XAxis dataKey="name" {...AXIS} tickLine={false} axisLine={false} />
        <YAxis
          {...AXIS}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={false} />
        <Bar
          dataKey="sold"
          name={soldLabel}
          radius={[8, 8, 0, 0]}
          {...ANIMATION}
        >
          {data.map((tier, index) => (
            <Cell key={tier.id} fill={`var(--chart-${(index % 5) + 1})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
