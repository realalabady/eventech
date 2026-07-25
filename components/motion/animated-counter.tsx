"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect } from "react";

type AnimatedCounterProps = {
  value: number;
  className?: string;
  /** Duration in seconds — capped by the canonical 700ms ceiling. */
  duration?: number;
};

/**
 * Count-up metric (ReactBits CountUp pattern, adapted to canonical motion rules:
 * animates ONCE, spring-free easeOut, respects prefers-reduced-motion).
 * Uses motion values — never React state — for the per-frame updates.
 */
export function AnimatedCounter({
  value,
  className,
  duration = 0.7,
}: AnimatedCounterProps) {
  const reduce = useReducedMotion();
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
      duration: Math.min(duration, 0.7),
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [count, value, duration, reduce]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
