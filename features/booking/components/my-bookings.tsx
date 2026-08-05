"use client";

import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/feedback/empty-state";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { Link } from "@/i18n/navigation";

import { useMyBookings } from "../hooks/use-bookings";

export function MyBookings() {
  const t = useTranslations("booking");
  const { bookings, loading } = useMyBookings();

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <EmptyState
        illustration="ticket"
        title={t("list.empty")}
        description={t("list.emptyHint")}
      />
    );
  }

  return (
    <Stagger className="space-y-3">
      {bookings.map((booking) => (
        <StaggerItem key={booking.id}>
          <Link
            href={`/bookings/${booking.id}`}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-[transform,border-color] duration-[var(--motion-fast)] ease-out hover:-translate-y-0.5 hover:border-foreground/20"
          >
            <div className="min-w-0 space-y-0.5">
              <p className="truncate font-medium">{booking.ticketTypeName}</p>
              <p className="font-mono text-sm text-muted-foreground">
                {booking.paymentReference}
              </p>
            </div>
            <Badge
              variant={booking.status === "approved" ? "default" : "secondary"}
            >
              {t(`status.${booking.status}`)}
            </Badge>
          </Link>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
