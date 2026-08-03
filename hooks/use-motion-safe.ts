"use client";

import { useReducedMotion } from "motion/react";
import { useMemo } from "react";

import {
  cardInteraction,
  fadeUp,
  floatingContent,
  overlayContent,
  pageTransition,
  stagger,
  staggerContainer,
} from "@/lib/motion";

/**
 * Single entry point for animated components.
 *
 * Every variant factory in lib/motion.ts takes a `reduce` flag; this hook binds
 * that flag once so call sites never read `useReducedMotion()` themselves and
 * can never forget to pass it. `reduce` is exposed for the cases a variant
 * cannot express — parallax, particles, WebGL backdrops — which §9 requires be
 * skipped outright rather than shortened.
 */
export function useMotionSafe() {
  const reduce = useReducedMotion() ?? false;

  return useMemo(
    () => ({
      reduce,
      fadeUp: (y?: number) => fadeUp(reduce, y),
      staggerContainer: (step: number = stagger.base) =>
        staggerContainer(reduce, step),
      pageTransition: () => pageTransition(reduce),
      overlayContent: () => overlayContent(reduce),
      floatingContent: () => floatingContent(reduce),
      cardInteraction: () => cardInteraction(reduce),
    }),
    [reduce],
  );
}
