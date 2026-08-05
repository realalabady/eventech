"use client";

import { Check } from "lucide-react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { transition } from "@/lib/motion";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthError } from "@/features/auth/components/auth-error";
import { useAuth } from "@/features/auth/hooks/use-auth";

import { useEvent } from "../hooks/use-events";
import { saveEventDraft, type EventPatch } from "../services/event-service";
import { WIZARD_STEPS, type WizardStep } from "../types";

/**
 * Steps are loaded on demand.
 *
 * Two reasons. Only one step is ever on screen, so eight of the nine were being
 * parsed for nothing. More importantly the step schemas pull in zod, and while
 * they were statically imported the bundler hoisted zod into the shared vendor
 * chunk — so every public page, including /discover which has no forms at all,
 * downloaded ~989KB of it. Behind a dynamic boundary zod becomes an async
 * chunk that only form routes fetch.
 *
 * `ssr` is left at its default: the steps still server-render, so there is no
 * blank frame on first paint — only the client bundle is split.
 */
const stepSkeleton = () => (
  <div className="space-y-5">
    <Skeleton className="h-11 w-full rounded-md" />
    <Skeleton className="h-11 w-full rounded-md" />
    <Skeleton className="h-11 w-40 rounded-full" />
  </div>
);

const ArtistsStep = dynamic(
  () => import("./steps/artists-step").then((m) => m.ArtistsStep),
  { loading: stepSkeleton },
);
const BasicsStep = dynamic(
  () => import("./steps/basics-step").then((m) => m.BasicsStep),
  { loading: stepSkeleton },
);
const ReviewStep = dynamic(
  () => import("./steps/review-step").then((m) => m.ReviewStep),
  { loading: stepSkeleton },
);
const ScheduleStep = dynamic(
  () => import("./steps/schedule-step").then((m) => m.ScheduleStep),
  { loading: stepSkeleton },
);
const BrandingStep = dynamic(
  () => import("./steps/simple-steps").then((m) => m.BrandingStep),
  { loading: stepSkeleton },
);
const PaymentStep = dynamic(
  () => import("./steps/simple-steps").then((m) => m.PaymentStep),
  { loading: stepSkeleton },
);
const TeamStep = dynamic(
  () => import("./steps/simple-steps").then((m) => m.TeamStep),
  { loading: stepSkeleton },
);
const TicketsStep = dynamic(
  () => import("./steps/tickets-step").then((m) => m.TicketsStep),
  { loading: stepSkeleton },
);
const VenueStep = dynamic(
  () => import("./steps/venue-step").then((m) => m.VenueStep),
  { loading: stepSkeleton },
);

export type StepProps = {
  event: NonNullable<ReturnType<typeof useEvent>["event"]>;
  organizationId: string;
  save: (patch: EventPatch) => Promise<boolean>;
  onDone: () => void;
};

// `React.ComponentType` rather than a function signature: `next/dynamic`
// returns a ComponentType, which a plain `(props) => ReactNode` will not accept.
const STEP_COMPONENTS: Record<WizardStep, React.ComponentType<StepProps>> = {
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
              reduce ? { duration: 0 } : transition.slow
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
          className="rounded-sm text-sm text-muted-foreground underline-offset-4 transition-colors duration-[var(--motion-fast)] outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {t("wizard.back")}
        </button>
      ) : null}
    </div>
  );
}
