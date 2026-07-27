"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { AuthError } from "@/features/auth/components/auth-error";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/i18n/navigation";

import { createBooking } from "../services/booking-service";

type TicketOption = {
  id: string;
  name: string;
  price: number;
  currency: string;
  remaining: number;
};

/**
 * Booking panel on the public event page. Anonymous visitors are sent to sign
 * in rather than shown a button that fails — the request needs an account so
 * the attendee can track it and receive the ticket.
 */
export function BookingRequest({
  eventId,
  ticketTypes,
  soldOut,
  bookingOpen,
}: {
  eventId: string;
  ticketTypes: TicketOption[];
  soldOut: boolean;
  bookingOpen: boolean;
}) {
  const t = useTranslations("booking");
  const tEvent = useTranslations("publicEvent");
  const locale = useLocale();
  const { status } = useAuth();
  const router = useRouter();

  const [ticketTypeId, setTicketTypeId] = useState(ticketTypes[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const selected = ticketTypes.find((type) => type.id === ticketTypeId);
  const maxQuantity = Math.min(selected?.remaining ?? 1, 10);

  if (status !== "authenticated") {
    return (
      <Button
        size="lg"
        className="w-full"
        nativeButton={false}
        render={<Link href="/login" />}
      >
        {t("request.signInFirst")}
      </Button>
    );
  }

  if (soldOut || !bookingOpen) {
    return (
      <Button size="lg" className="w-full" disabled>
        {soldOut ? tEvent("soldOut") : tEvent("bookingClosed")}
      </Button>
    );
  }

  async function onSubmit() {
    setBusy(true);
    setError(undefined);
    const result = await createBooking(eventId, ticketTypeId, quantity);
    setBusy(false);
    if (!result.ok) {
      setError(result.errorKey);
      return;
    }
    router.push(`/bookings/${result.data?.bookingId}`);
  }

  return (
    <div className="space-y-4">
      <AuthError message={error ? t(`errors.${error}`) : undefined} />

      {ticketTypes.length > 1 ? (
        <div className="grid gap-2">
          <Label htmlFor="booking-type">{tEvent("tickets")}</Label>
          <select
            id="booking-type"
            value={ticketTypeId}
            onChange={(event) => {
              setTicketTypeId(event.target.value);
              setQuantity(1);
            }}
            className="h-11 rounded-md border border-input bg-transparent px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {ticketTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="booking-quantity">{t("request.quantityLabel")}</Label>
        <select
          id="booking-quantity"
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="h-11 rounded-md border border-input bg-transparent px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {Array.from(
            { length: Math.max(maxQuantity, 1) },
            (_, i) => i + 1,
          ).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={busy || !ticketTypeId}
        onClick={onSubmit}
      >
        {t("request.submit")}
      </Button>

      {selected && selected.price > 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          {t("request.total", {
            amount: new Intl.NumberFormat(locale, {
              style: "currency",
              currency: selected.currency,
              maximumFractionDigits: 0,
            }).format(selected.price * quantity),
          })}
        </p>
      ) : null}
    </div>
  );
}
