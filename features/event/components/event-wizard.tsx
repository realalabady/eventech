"use client";

import { Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { AuthError } from "@/features/auth/components/auth-error";
import { useAuth } from "@/features/auth/hooks/use-auth";

import { useEvent } from "../hooks/use-events";
import { saveEventDraft, type EventPatch } from "../services/event-service";
import { WIZARD_STEPS, type WizardStep } from "../types";

import { ArtistsStep } from "./steps/artists-step";
import { BasicsStep } from "./steps/basics-step";
import { ReviewStep } from "./steps/review-step";
import { ScheduleStep } from "./steps/schedule-step";
import { BrandingStep, PaymentStep, TeamStep } from "./steps/simple-steps";
import { TicketsStep } from "./steps/tickets-step";
import { VenueStep } from "./steps/venue-step";

export type StepProps = {
  event: NonNullable<ReturnType<typeof useEvent>["event"]>;
  organizationId: string;
  save: (patch: EventPatch) => Promise<boolean>;
  onDone: () => void;
};

const STEP_COMPONENTS: Record<
  WizardStep,
  (props: StepProps) => React.ReactNode
> = {
  basics: BasicsStep,
  venue: VenueStep,
  schedule: ScheduleStep,
  artists: ArtistsStep,
  tickets: TicketsStep,
  branding: BrandingStep,
  team: TeamStep,
  payment: PaymentStep,
  review: ReviewStep,
};

/**
 * Nine-step event wizard (guide 50 §10). Each step saves its own patch before
 * advancing, so a half-finished event is always recoverable — nothing is lost
 * if the organizer closes the tab mid-way.
 */
export function EventWizard({ eventId }: { eventId: string }) {
  const t = useTranslations("event");
  const { claims } = useAuth();
  const { event, loading } = useEvent(eventId);
  const reduce = useReducedMotion();

  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | undefined>();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-11 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!event || !claims?.organizationId) {
    return null;
  }

  async function save(patch: EventPatch): Promise<boolean> {
    setSaving(true);
    setError(undefined);
    const result = await saveEventDraft(eventId, patch);
    setSaving(false);
    if (!result.ok) {
      setError("saveFailed");
      return false;
    }
    setSavedAt(Date.now());
    return true;
  }

  const step = WIZARD_STEPS[index];
  const StepComponent = STEP_COMPONENTS[step];
  const progress = ((index + 1) / WIZARD_STEPS.length) * 100;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {t("wizard.stepLabel", {
              current: index + 1,
              total: WIZARD_STEPS.length,
            })}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {saving ? (
              t("wizard.saving")
            ) : savedAt ? (
              <>
                <Check className="size-3.5 text-success" />
                {t("wizard.saved")}
              </>
            ) : null}
          </p>
        </div>

        <div className="h-1 overflow-hidden rounded-full bg-surface">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={
              reduce ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }
            }
          />
        </div>

        <ol className="flex flex-wrap gap-x-4 gap-y-1">
          {WIZARD_STEPS.map((name, i) => (
            <li
              key={name}
              aria-current={i === index ? "step" : undefined}
              className={
                i === index
                  ? "text-sm font-medium text-foreground"
                  : "text-sm text-muted-foreground"
              }
            >
              {t(`steps.${name}`)}
            </li>
          ))}
        </ol>
      </div>

      <AuthError message={error ? t(`wizard.${error}`) : undefined} />

      <StepComponent
        event={event}
        organizationId={claims.organizationId}
        save={save}
        onDone={() =>
          setIndex((current) => Math.min(current + 1, WIZARD_STEPS.length - 1))
        }
      />

      {index > 0 ? (
        <button
          type="button"
          onClick={() => setIndex((current) => Math.max(current - 1, 0))}
          className="text-sm text-muted-foreground underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline"
        >
          {t("wizard.back")}
        </button>
      ) : null}
    </div>
  );
}
