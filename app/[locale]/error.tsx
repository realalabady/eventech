"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { ErrorState } from "@/components/feedback/error-state";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary for everything under /[locale].
 *
 * There was no error.tsx anywhere in the app, so an exception in any page
 * escaped to Next's default screen — a stack trace in development and a bare
 * white page in production, neither localized nor recoverable.
 *
 * The `error` object is logged, never rendered: TASK_05 forbids exposing
 * technical detail, and ErrorState has no prop that could carry it. `reset()`
 * re-runs the failed segment, which is a real retry rather than a reload.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    // Digest is the only safe correlator in production builds — the message is
    // redacted there, but this ties the screen to the server-side log entry.
    console.error("[route-error]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col justify-center px-4 py-24">
      <ErrorState
        title={t("errorTitle")}
        description={t("errorDescription")}
        action={<Button onClick={reset}>{t("retry")}</Button>}
      />
    </div>
  );
}
