"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";

import { useMotionSafe } from "@/hooks/use-motion-safe";
import { MOTION_CEILING, duration as durationTokens, easing } from "@/lib/motion";

type AnimatedCounterProps = {
  value: number;
  className?: string;
  /** Duration in seconds — clamped to the 500ms ceiling. */
  duration?: number;
};

/**
 * Count-up metric (ReactBits CountUp pattern, adapted to the motion rules:
 * animates ONCE, spring-free easeOut, respects prefers-reduced-motion).
 * Uses motion values — never React state — for the per-frame updates.
 */
export function AnimatedCounter({
  value,
  className,
  duration = durationTokens.slow,
}: AnimatedCounterProps) {
  const { reduce } = useMotionSafe();
  const count = useMotionValue(reduce ? value : 0);
  const rounded = useTransform(count, (latest) =>
    Math.round(latest).toLocaleString(),
  );

  useEffect(() => {
    if (reduce) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, {
      duration: Math.min(duration, MOTION_CEILING),
      ease: easing.out,
    });
    return () => controls.stop();
  }, [count, value, duration, reduce]);

  return (
    <motion.span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {rounded}
    </motion.span>
  );
}
