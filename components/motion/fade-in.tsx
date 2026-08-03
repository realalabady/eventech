"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { useMotionSafe } from "@/hooks/use-motion-safe";
import { distance } from "@/lib/motion";

type FadeInProps = {
  children: ReactNode;
  /** Delay in seconds. */
  delay?: number;
  /** Vertical offset in px before the element settles. */
  y?: number;
  className?: string;
};

/**
 * Entrance reveal, played once when scrolled into view.
 * Timing comes from lib/motion.ts — no durations live here.
 */
export function FadeIn({
  children,
  delay = 0,
  y = distance.md,
  className,
}: FadeInProps) {
  const motionSafe = useMotionSafe();

  return (
    <motion.div
      className={className}
      variants={motionSafe.fadeUp(y)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
