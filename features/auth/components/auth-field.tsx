"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { transition } from "@/lib/motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthFieldProps = React.ComponentProps<typeof Input> & {
  id: string;
  label: string;
  /** Already-translated error copy, or undefined when valid. */
  error?: string;
  hint?: string;
};

/**
 * Label above input, hint and error below (guide 26 form rules).
 * The error slides in rather than popping, so the form never jumps abruptly.
 */
export function AuthField({
  id,
  label,
  error,
  hint,
  ...inputProps
}: AuthFieldProps) {
  const reduce = useReducedMotion();

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} aria-invalid={Boolean(error)} {...inputProps} />
      <AnimatePresence mode="wait" initial={false}>
        {error ? (
          <motion.p
            key="error"
            role="alert"
            className="text-sm text-destructive"
            initial={reduce ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={transition.fast}
          >
            {error}
          </motion.p>
        ) : hint ? (
          <p className="text-sm text-muted-foreground">{hint}</p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
