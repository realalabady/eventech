"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthError } from "@/features/auth/components/auth-error";
import { Link } from "@/i18n/navigation";

import { useOrganizationPublic } from "../hooks/use-organization-public";

import { useBooking } from "../hooks/use-bookings";
import { cancelBooking, uploadReceipt } from "../services/booking-service";
import { isCancellable, needsReceipt } from "../types";

/**
 * The attendee's view of one booking: what to transfer, where, and with which
 * reference — then the receipt upload that moves it into the review queue.
 */
export function BookingDetail({ bookingId }: { bookingId: string }) {
  const t = useTranslations("booking");
  const locale = useLocale();
  const { booking, loading } = useBooking(bookingId);
  const organization = useOrganizationPublic(booking?.organizationId);

  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!booking) {
    return <p className="text-muted-foreground">{t("detail.notFound")}</p>;
  }

  async function onPickReceipt(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !booking) return;
    setError(undefined);
    setBusy(true);
    const result = await uploadReceipt(booking.eventId, booking.id, file);
    setBusy(false);
    if (!result.ok) setError(result.errorKey);
  }

  async function onCancel() {
    if (!booking) return;
    setBusy(true);
    setError(undefined);
    const result = await cancelBooking(booking.id);
    setBusy(false);
    if (!result.ok) setError(result.errorKey);
  }

  const amount = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: booking.currency,
    maximumFractionDigits: 0,
  }).format(booking.amount);

  const rows: Array<[string, string]> = [
    ["amount", amount],
    ["reference", booking.paymentReference],
  ];
  if (organization?.payment) {
    rows.push(
      ["bank", organization.payment.bankName],
      ["accountHolder", organization.payment.accountHolder],
      ["iban", organization.payment.iban],
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("detail.title")}
        </h1>
        <Badge
          variant={booking.status === "approved" ? "default" : "secondary"}
        >
          {t(`status.${booking.status}`)}
        </Badge>
      </div>

      <AuthError message={error ? t(`errors.${error}`) : undefined} />

      {booking.status === "approved" ? (
        <div className="space-y-3 rounded-md border border-success/30 bg-success/10 px-4 py-3">
          <p className="text-sm text-success">{t("detail.approved")}</p>
          {booking.ticketId ? (
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href={`/tickets/${booking.ticketId}`} />}
            >
              {t("detail.viewTicket")}
            </Button>
          ) : (
            // Approval succeeded but issuance did not; approving again repairs
            // it, so tell the attendee to wait rather than showing a dead link.
            <p className="text-sm text-success/80">
              {t("detail.ticketPending")}
            </p>
          )}
        </div>
      ) : null}

      {booking.status === "rejected" && booking.rejectionReason ? (
        <div className="space-y-2">
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {t("detail.rejectedReason", { reason: booking.rejectionReason })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("detail.reuploadHint")}
          </p>
        </div>
      ) : null}

      {needsReceipt(booking.status) ? (
        <p className="max-w-[60ch] text-foreground/70">
          {t("detail.instructions")}
        </p>
      ) : null}

      <dl className="divide-y divide-border rounded-xl border border-border bg-card">
        {rows.map(([key, value]) => (
          <div key={key} className="flex justify-between gap-4 px-5 py-4">
            <dt className="text-sm text-muted-foreground">
              {t(`detail.${key}`)}
            </dt>
            <dd
              className={
                key === "iban" || key === "reference"
                  ? "font-mono text-sm"
                  : "text-sm"
              }
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {!organization?.payment && needsReceipt(booking.status) ? (
        <p className="rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          {t("detail.noBankDetails")}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t("detail.referenceHint")}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-medium tracking-tight">
          {t("detail.uploadHeading")}
        </h2>

        {booking.status === "pending_review" ? (
          <p className="rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            {t("detail.uploaded")}
          </p>
        ) : null}

        {needsReceipt(booking.status) ? (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={onPickReceipt}
            />
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {t("detail.upload")}
            </Button>
          </>
        ) : null}
      </section>

      {isCancellable(booking.status) ? (
        <Button variant="ghost" disabled={busy} onClick={onCancel}>
          {t("detail.cancel")}
        </Button>
      ) : null}
    </div>
  );
}
