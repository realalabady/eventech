import type { ReactNode } from "react";

import { StateIllustration } from "@/components/feedback/state-illustration";
import { cn } from "@/lib/utils";

/**
 * Error state — friendly message plus a retry, per TASK_05.
 *
 * Deliberately has no prop for an exception, stack, or error code. TASK_05 says
 * "do not expose technical errors", and the reliable way to honour that is to
 * make the technical detail unrepresentable here rather than trusting each
 * caller to strip it. Diagnostics belong in the console and in monitoring.
 *
 * `role="alert"` announces the failure as soon as it renders, because an error
 * that replaces content the user was waiting for is not something they should
 * have to go looking for.
 */
export function ErrorState({
  title,
  description,
  action,
  className,
}: {
  /** Already-translated heading. */
  title: string;
  /** Already-translated supporting sentence, in plain language. */
  description?: string;
  /** Retry control. */
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-14 text-center shadow-xs",
        // Fades in rather than appearing instantly — TASK_05 asks for an
        // animated appearance, and a failure that pops in reads as a glitch.
        "animate-in fade-in duration-[var(--motion-base)] motion-reduce:animate-none",
        className,
      )}
    >
      <StateIllustration name="error" className="text-destructive/60" />

      <div className="space-y-1.5">
        <p className="text-h4">{title}</p>
        {description ? (
          <p className="mx-auto max-w-prose text-small text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {action}
    </div>
  );
}
