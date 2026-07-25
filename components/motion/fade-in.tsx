"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  /** Delay in seconds. */
  delay?: number;
  /** Vertical offset in px before the element settles. */
  y?: number;
  className?: string;
};

/**
 * Entrance reveal. Durations follow the canonical motion scale
 * (guides/50_CANONICAL_DECISIONS.md §9): 400ms, easeOut, opacity+transform only.
 */
export function FadeIn({
  children,
  delay = 0,
  y = 16,
  className,
}: FadeInProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
