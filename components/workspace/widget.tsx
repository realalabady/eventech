"use client";

import { ArrowRight, ChevronDown, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { useId, useState } from "react";

import { ErrorState } from "@/components/feedback/error-state";
import { StateIllustration } from "@/components/feedback/state-illustration";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * The dashboard widget shell.
 *
 * TASK_07 requires every widget to carry a title, subtitle, trend slot, and
 * loading / empty / error / hover states. Putting that in one component is the
 * only way the requirement actually holds: implementing four states per widget
 * by hand is how widgets end up with three of them.
 *
 * Labels arrive already translated. This is a client component (it owns the
 * collapse state and the refresh callback) and deliberately has no
 * `useTranslations` of its own, so callers stay in control of their namespace.
 */

export type WidgetState = "ready" | "loading" | "empty" | "error";

export type WidgetLabels = {
  refresh: string;
  collapse: string;
  expand: string;
  open: string;
  errorTitle: string;
  errorDescription: string;
  emptyTitle: string;
  /** Optional guidance under the empty illustration. */
  emptyDescription?: string;
  /** Announced while `state` is "loading". */
  loading: string;
};

export function Widget({
  title,
  subtitle,
  trend,
  state = "ready",
  labels,
  onRefresh,
  href,
  collapsible = false,
  skeleton,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  /** Trend chip or any compact status indicator, rendered beside the title. */
  trend?: ReactNode;
  state?: WidgetState;
  labels: WidgetLabels;
  /** Presence of this enables the refresh control. */
  onRefresh?: () => void;
  /** Presence of this enables the "open details" control. */
  href?: string;
  collapsible?: boolean;
  /** Shown while `state` is "loading". Should mirror the body's geometry. */
  skeleton?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const bodyId = useId();

  return (
    <section
      className={cn(
        "flex min-w-0 flex-col rounded-xl border border-border bg-card shadow-xs transition-[border-color,box-shadow] duration-[var(--motion-fast)] ease-out hover:border-foreground/20 hover:shadow-md",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-h4">{title}</h3>
            {trend}
          </div>
          {subtitle ? (
            <p className="text-caption text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {onRefresh ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={labels.refresh}
              onClick={onRefresh}
            >
              {/* Spins only while the widget is actually fetching, so the icon
                  reports state rather than decorating the button. */}
              <RefreshCw
                aria-hidden="true"
                className={cn(
                  state === "loading" && "animate-spin motion-reduce:animate-none",
                )}
              />
            </Button>
          ) : null}

          {collapsible ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={collapsed ? labels.expand : labels.collapse}
              aria-expanded={!collapsed}
              aria-controls={bodyId}
              onClick={() => setCollapsed((v) => !v)}
            >
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "transition-transform duration-[var(--motion-fast)] ease-out motion-reduce:transition-none",
                  collapsed && "-rotate-90 rtl:rotate-90",
                )}
              />
            </Button>
          ) : null}

          {href ? (
            // Icon-only below `sm`. The label plus two icon buttons made this
            // header incompressible — `shrink-0` on the action group meant the
            // whole widget grew to 398px inside a 336px viewport and scrolled
            // the page sideways. The accessible name is preserved either way.
            <Button
              variant="ghost"
              size="xs"
              nativeButton={false}
              aria-label={labels.open}
              render={<Link href={href} />}
            >
              <ArrowRight aria-hidden="true" className="rtl:rotate-180" />
              <span className="sr-only sm:not-sr-only">{labels.open}</span>
            </Button>
          ) : null}
        </div>
      </header>

      {/* `hidden` rather than unmounting: collapsing a widget should not throw
          away its scroll position or restart its entrance animation. */}
      <div id={bodyId} hidden={collapsed} className="px-5 pb-5">
        <WidgetBody state={state} labels={labels} skeleton={skeleton}>
          {children}
        </WidgetBody>
      </div>
    </section>
  );
}

function WidgetBody({
  state,
  labels,
  skeleton,
  children,
}: {
  state: WidgetState;
  labels: WidgetLabels;
  skeleton?: ReactNode;
  children: ReactNode;
}) {
  if (state === "loading") {
    return (
      <div role="status" aria-busy="true">
        <span className="sr-only">{labels.loading}</span>
        {skeleton}
      </div>
    );
  }

  if (state === "error") {
    return (
      <ErrorState
        title={labels.errorTitle}
        description={labels.errorDescription}
        className="border-0 bg-transparent px-0 py-8 shadow-none"
      />
    );
  }

  if (state === "empty") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <StateIllustration name="empty" className="size-12" />
        <p className="text-small font-medium">{labels.emptyTitle}</p>
        {labels.emptyDescription ? (
          <p className="max-w-prose text-caption text-muted-foreground">
            {labels.emptyDescription}
          </p>
        ) : null}
      </div>
    );
  }

  return <>{children}</>;
}
