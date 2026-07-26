"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/** Form-level error banner. Gentle entrance, never a shake on the whole form. */
export function AuthError({ message }: { message?: string }) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
          initial={reduce ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}
