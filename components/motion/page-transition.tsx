"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useMotionSafe } from "@/hooks/use-motion-safe";

/**
 * Route transition, mounted from app/[locale]/template.tsx.
 *
 * Next.js remounts a `template.tsx` on every navigation, so keying on the
 * pathname replays the enter variant per route without AnimatePresence — which
 * cannot see the outgoing tree in the App Router anyway. That means there is no
 * exit animation here by design: the `exit` variant in pageTransition() is kept
 * for surfaces that do control both sides (dialogs, sheets, wizard steps).
 *
 * `initial` is deliberately the hidden state even though the server renders the
 * settled one. The scale floor is 0.99 and opacity resolves in 350ms, so the
 * first paint difference is imperceptible; the alternative — a mount guard —
 * would suppress the animation on the very navigation it exists to smooth.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const motionSafe = useMotionSafe();

  return (
    <motion.div
      key={pathname}
      variants={motionSafe.pageTransition()}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}
