"use client";

import { CheckCircle2, Eye, XCircle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";

import { formatPublicDate } from "@/features/discovery/lib/format";

import type { ScanOutcome } from "../services/scanner-service";

/**
 * The one thing door staff look at, so it has to read at arm's length in a dark
 * room: colour and icon carry the verdict at a glance, and the text underneath
 * confirms it — colour never communicates alone (canonical §8).
 */
export function ScanResultCard({
  outcome,
  previewOnly,
}: {
  outcome: ScanOutcome;
  previewOnly: boolean;
}) {
  const t = useTranslations("scanner");
  const locale = useLocale();
  const reduce = useReducedMotion();

  const admitted = outcome.ok && !previewOnly;
  const tone = outcome.ok
    ? previewOnly
      ? "info"
      : "success"
    : outcome.errorKey === "alreadyCheckedIn"
      ? "warning"
      : "destructive";

  const Icon = outcome.ok ? (previewOnly ? Eye : CheckCircle2) : XCircle;

  const headline = outcome.ok
    ? previewOnly
      ? t(`result.valid.${outcome.ticket.status}`)
      : t("result.admitted", { count: outcome.ticket.quantity })
    : t(`errors.${outcome.errorKey}`);

  const usedAt =
    !outcome.ok && outcome.usedAt
      ? formatPublicDate(outcome.usedAt, null, locale)
      : null;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      role="status"
      aria-live="polite"
      className={`space-y-3 rounded-2xl border px-6 py-6 text-center ${TONE[tone]}`}
    >
      <Icon className="mx-auto size-10" aria-hidden />
      <p className="text-xl font-semibold tracking-tight">{headline}</p>

      {outcome.ok ? (
        <div className="space-y-0.5 text-sm opacity-90">
          <p className="font-medium">{outcome.ticket.eventTitle}</p>
          <p>
            {t("result.holder", {
              name: outcome.ticket.ownerName ?? t("result.unnamed"),
              type: outcome.ticket.ticketTypeName,
            })}
          </p>
          {admitted ? null : (
            <p>{t("result.quantity", { count: outcome.ticket.quantity })}</p>
          )}
        </div>
      ) : null}

      {usedAt ? (
        <p className="text-sm opacity-90">
          {t("result.usedAt", { when: usedAt })}
        </p>
      ) : null}
    </motion.div>
  );
}

const TONE = {
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive",
  info: "border-info/30 bg-info/10 text-info",
} as const;
