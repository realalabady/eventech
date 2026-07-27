"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPublicDate } from "@/features/discovery/lib/format";
import { useNow } from "@/hooks/use-now";
import { Link } from "@/i18n/navigation";

import { useMyTickets } from "../hooks/use-tickets";
import { walletBucket, type TicketDoc, type WalletBucket } from "../types";

const BUCKETS: WalletBucket[] = ["upcoming", "used", "past"];

/** Upcoming / used / past, in that order (guide 40's wallet). */
export function TicketWallet() {
  const t = useTranslations("ticket");
  const locale = useLocale();
  const { tickets, loading, failed } = useMyTickets();

  // "Upcoming" versus "past" is a client-side judgement: the server's idea of
  // now is not the viewer's, so it stays null until mount.
  const now = useNow();

  const grouped = useMemo(() => {
    const buckets: Record<WalletBucket, TicketDoc[]> = {
      upcoming: [],
      used: [],
      past: [],
    };
    for (const ticket of tickets) {
      buckets[walletBucket(ticket, now ?? 0)].push(ticket);
    }
    for (const list of Object.values(buckets)) {
      list.sort(
        (a, b) =>
          (a.eventStartDate?.toMillis() ?? 0) -
          (b.eventStartDate?.toMillis() ?? 0),
      );
    }
    return buckets;
  }, [tickets, now]);

  if (loading || now === null) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (failed) {
    return (
      <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {t("wallet.failed")}
      </p>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="space-y-2 rounded-xl border border-border bg-card px-6 py-12 text-center">
        <p className="font-medium">{t("wallet.empty")}</p>
        <p className="text-sm text-muted-foreground">{t("wallet.emptyHint")}</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="upcoming" className="gap-6">
      <TabsList>
        {BUCKETS.map((bucket) => (
          <TabsTrigger key={bucket} value={bucket}>
            {t(`wallet.${bucket}`)}
          </TabsTrigger>
        ))}
      </TabsList>

      {BUCKETS.map((bucket) => (
        <TabsContent key={bucket} value={bucket}>
          {grouped[bucket].length === 0 ? (
            <p className="rounded-xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
              {t(`wallet.${bucket}Empty`)}
            </p>
          ) : (
            <Stagger className="space-y-3">
              {grouped[bucket].map((ticket) => (
                <StaggerItem key={ticket.id}>
                  <TicketRow ticket={ticket} locale={locale} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function TicketRow({ ticket, locale }: { ticket: TicketDoc; locale: string }) {
  const t = useTranslations("ticket");
  const when = formatPublicDate(
    ticket.eventStartDate?.toMillis() ?? null,
    null,
    locale,
  );

  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-[transform,border-color] duration-150 ease-out hover:-translate-y-0.5 hover:border-foreground/20"
    >
      <div className="min-w-0 space-y-1">
        <p className="truncate font-medium">{ticket.eventTitle}</p>
        <p className="text-sm text-muted-foreground">
          {t("admits", {
            count: ticket.quantity,
            type: ticket.ticketTypeName,
          })}
          {when ? ` · ${when}` : ""}
        </p>
      </div>
      <Badge variant={ticket.status === "active" ? "default" : "secondary"}>
        {t(`status.${ticket.status}`)}
      </Badge>
    </Link>
  );
}
