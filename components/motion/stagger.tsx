"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { useMotionSafe } from "@/hooks/use-motion-safe";
import { stagger as staggerTokens } from "@/lib/motion";

type StaggerProps = {
  children: ReactNode;
  className?: string;
  /** Per-child delay in seconds. */
  step?: number;
};

/**
 * Staggered reveal for lists and grids (§9: dashboard stagger on first load).
 * Wrap children in <StaggerItem> within the same client tree.
 *
 * Under reduced motion the container still mounts, but `staggerChildren` drops
 * to 0 and each item fades without travel — the cascade disappears, the content
 * does not. Returning a plain <div> instead would strip the fade too.
 */
export function Stagger({
  children,
  className,
  step = staggerTokens.base,
}: StaggerProps) {
  const motionSafe = useMotionSafe();

  return (
    <motion.div
      className={className}
      variants={motionSafe.staggerContainer(step)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const motionSafe = useMotionSafe();

  return (
    <motion.div className={className} variants={motionSafe.fadeUp()}>
      {children}
    </motion.div>
  );
}
