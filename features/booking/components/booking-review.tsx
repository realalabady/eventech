"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { AuthError } from "@/features/auth/components/auth-error";
import { useAuth } from "@/features/auth/hooks/use-auth";

import { useOrganizationBookings } from "../hooks/use-bookings";
import { approveBooking, rejectBooking } from "../services/booking-service";
import type { BookingDoc } from "../types";

function BookingRow({
  booking,
  locale,
  onError,
}: {
  booking: BookingDoc;
  locale: string;
  onError: (key: string | undefined) => void;
}) {
  const t = useTranslations("booking");
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const amount = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: booking.currency,
    maximumFractionDigits: 0,
  }).format(booking.amount);

  async function onApprove() {
    setBusy(true);
    onError(undefined);
    const result = await approveBooking(booking.id);
    setBusy(false);
    if (!result.ok) onError(result.errorKey);
  }

  async function onReject() {
    if (!reason.trim()) return;
    setBusy(true);
    onError(undefined);
    const result = await rejectBooking(booking.id, reason);
    setBusy(false);
    if (!result.ok) {
      onError(result.errorKey);
      return;
    }
    setRejecting(false);
    setReason("");
  }

  return (
    <li className="space-y-4 rounded-xl border border-border bg-card px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-0.5">
          <p className="truncate font-medium">
            {booking.attendeeName ?? booking.attendeeEmail}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("review.quantity", {
              count: booking.quantity,
              type: booking.ticketTypeName,
            })}
          </p>
          <p className="font-mono text-sm text-muted-foreground">
            {booking.paymentReference}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-sm">{amount}</span>
          <Badge variant="secondary">{t(`status.${booking.status}`)}</Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {booking.payment?.receiptUrl ? (
          <a
            href={booking.payment.receiptUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-sm text-muted-foreground underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline"
          >
            {t("review.viewReceipt")}
          </a>
        ) : null}

        {booking.status === "pending_review" && !rejecting ? (
          <>
            <Button size="sm" disabled={busy} onClick={onApprove}>
              {t("review.approve")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => setRejecting(true)}
            >
              {t("review.reject")}
            </Button>
          </>
        ) : null}
      </div>

      {rejecting ? (
        <div className="space-y-3">
          <div className="grid gap-2">
            <Label htmlFor={`reason-${booking.id}`}>
              {t("review.reasonLabel")}
            </Label>
            <Textarea
              id={`reason-${booking.id}`}
              rows={2}
              value={reason}
              placeholder={t("review.reasonPlaceholder")}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              size="sm"
              variant="destructive"
              disabled={busy || !reason.trim()}
              onClick={onReject}
            >
              {t("review.confirmReject")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setRejecting(false);
                setReason("");
              }}
            >
              {t("review.cancelReject")}
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  );
}

export function BookingReview() {
  const t = useTranslations("booking");
  const locale = useLocale();
  const { claims } = useAuth();
  const { bookings, loading } = useOrganizationBookings(claims?.organizationId);
  const [error, setError] = useState<string | undefined>();

  // Receipts waiting on a decision come first — that is the actual job here.
  const pending = bookings.filter((b) => b.status === "pending_review");
  const others = bookings.filter((b) => b.status !== "pending_review");

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <AuthError message={error ? t(`errors.${error}`) : undefined} />

      {bookings.length === 0 ? (
        <div className="space-y-2 rounded-xl border border-border bg-card px-6 py-12 text-center">
          <p className="font-medium">{t("review.empty")}</p>
          <p className="text-sm text-muted-foreground">
            {t("review.emptyHint")}
          </p>
        </div>
      ) : null}

      {pending.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-medium tracking-tight">
            {t("review.pendingHeading")}
          </h2>
          <ul className="space-y-3">
            {pending.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                locale={locale}
                onError={setError}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {others.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-medium tracking-tight">
            {t("review.otherHeading")}
          </h2>
          <ul className="space-y-3">
            {others.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                locale={locale}
                onError={setError}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
