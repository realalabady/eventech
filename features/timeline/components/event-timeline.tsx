"use client";

import { Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { useEventTimeline } from "../hooks/use-timeline";
import { setTimelineStage } from "../services/timeline-service";
import { completionPercent, nextStage } from "../types";

/**
 * The production timeline: six milestones, in order, each one togglable.
 *
 * Progress is expressed as a filled rail rather than a number alone, because
 * guide 41 wants the organizer to see the shape of the job at a glance. The
 * rail animates its scale, never its width (§9).
 */
export function EventTimeline({ eventId }: { eventId: string }) {
  const t = useTranslations("timeline");
  const { stages, loading, failed } = useEventTimeline(eventId);
  const reduce = useReducedMotion();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onToggle(stageId: string, completed: boolean) {
    setBusy(stageId);
    setError(null);
    const result = await setTimelineStage(stageId, completed);
    setBusy(null);
    if (!result.ok) setError(result.errorKey);
  }

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (failed) {
    return (
      <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {t("failed")}
      </p>
    );
  }

  if (stages.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
        {t("empty")}
      </p>
    );
  }

  const percent = completionPercent(stages);
  const next = nextStage(stages);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {next
              ? t("nextUp", { stage: t(`stage.${next.stage}`) })
              : t("allDone")}
          </p>
          <p className="text-sm font-medium tabular-nums">
            {t("percent", { percent })}
          </p>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full origin-left rounded-full bg-primary"
            initial={reduce ? false : { scaleX: 0 }}
            animate={{ scaleX: percent / 100 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t(`errors.${error}`)}
        </p>
      ) : null}

      <ol className="space-y-1">
        {stages.map((stage) => (
          <li key={stage.id}>
            <button
              type="button"
              disabled={busy === stage.id}
              onClick={() => onToggle(stage.id, !stage.completed)}
              aria-pressed={stage.completed}
              className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-start transition-colors duration-150 hover:border-border hover:bg-card disabled:opacity-60"
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-150 ${
                  stage.completed
                    ? "border-success bg-success/15 text-success"
                    : "border-border text-transparent"
                }`}
              >
                <Check className="size-3.5" aria-hidden />
              </span>
              <span
                className={
                  stage.completed
                    ? "text-sm text-muted-foreground line-through"
                    : "text-sm"
                }
              >
                {t(`stage.${stage.stage}`)}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
