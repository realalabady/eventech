"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { transition } from "@/lib/motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPublicDate } from "@/features/discovery/lib/format";

import { useTicket } from "../hooks/use-tickets";

/**
 * The thing the attendee holds up at the door.
 *
 * The QR gets the reveal sequence canonical §9 asks for — it unblurs and settles
 * rather than snapping in, which reads as the ticket "developing". Everything
 * around it stays quiet so the code is unmistakably the subject.
 */
export function TicketDetail({ ticketId }: { ticketId: string }) {
  const t = useTranslations("ticket");
  const locale = useLocale();
  const { ticket, loading } = useTicket(ticketId);
  const reduce = useReducedMotion();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="aspect-square w-full max-w-sm" />
      </div>
    );
  }

  if (!ticket) {
    return <p className="text-muted-foreground">{t("detail.notFound")}</p>;
  }

  const when = formatPublicDate(
    ticket.eventStartDate?.toMillis() ?? null,
    ticket.eventTimezone,
    locale,
  );
  const spent = ticket.status !== "active";

  const rows: Array<[string, string]> = [
    [
      "type",
      t("admits", { count: ticket.quantity, type: ticket.ticketTypeName }),
    ],
  ];
  if (when) rows.push(["when", when]);
  if (ticket.usedAt) {
    rows.push([
      "checkedIn",
      formatPublicDate(ticket.usedAt.toMillis(), null, locale) ?? "",
    ]);
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            {ticket.eventTitle}
          </h1>
          <Badge variant={spent ? "secondary" : "default"}>
            {t(`status.${ticket.status}`)}
          </Badge>
        </div>
        <p className="text-muted-foreground">{t("detail.subtitle")}</p>
      </header>

      <motion.div
        initial={
          reduce ? false : { opacity: 0, scale: 0.94, filter: "blur(12px)" }
        }
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={transition.slow}
        className="mx-auto w-full max-w-sm space-y-4 rounded-3xl border border-border bg-card p-6"
      >
        <div
          className={`relative aspect-square overflow-hidden rounded-2xl bg-white transition-opacity duration-[var(--motion-base)] ${
            spent ? "opacity-30" : ""
          }`}
        >
          {/* Never optimized: re-encoding a QR can cost it enough contrast to
              stop scanning, and the tokenised Storage URL is already a one-off. */}
          <Image
            src={ticket.qrImage}
            alt={t("detail.qrAlt")}
            fill
            className="object-contain p-3"
            unoptimized
            priority
          />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          {spent ? t("detail.spentHint") : t("detail.brightnessHint")}
        </p>
      </motion.div>

      <dl className="divide-y divide-border rounded-xl border border-border bg-card">
        {rows.map(([key, value]) => (
          <div key={key} className="flex justify-between gap-4 px-5 py-4">
            <dt className="text-sm text-muted-foreground">
              {t(`detail.${key}`)}
            </dt>
            <dd className="text-sm">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
