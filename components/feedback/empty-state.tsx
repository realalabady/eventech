import type { ReactNode } from "react";

import {
  StateIllustration,
  type IllustrationName,
} from "@/components/feedback/state-illustration";
import { cn } from "@/lib/utils";

/**
 * Empty state — illustration, message, and up to two actions, per TASK_05.
 *
 * All text arrives already translated. This component takes `ReactNode` for the
 * actions rather than button props so callers keep control of the handler, the
 * variant, and the loading state, and so this file needs no client boundary.
 *
 * `description` and the actions are optional: a filtered list that returns
 * nothing needs a sentence and a "clear filters" button, while a first-run
 * dashboard needs the full treatment. Forcing both would produce filler copy.
 */
export function EmptyState({
  illustration = "empty",
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: {
  illustration?: IllustrationName;
  /** Already-translated heading. */
  title: string;
  /** Already-translated supporting sentence. */
  description?: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-14 text-center shadow-xs",
        className,
      )}
    >
      <StateIllustration name={illustration} />

      <div className="space-y-1.5">
        <p className="text-h4">{title}</p>
        {description ? (
          <p className="mx-auto max-w-prose text-small text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {primaryAction || secondaryAction ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {primaryAction}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
