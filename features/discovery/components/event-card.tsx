import { CalendarDays, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";

import { formatPrice, formatPublicDate, lowestPrice } from "../lib/format";
import type { PublicEvent } from "../services/public-data";

/**
 * Public event card. Deliberately the same shape as the marketing homepage
 * card so discovery and the landing page read as one product.
 */
export async function DiscoveryEventCard({
  event,
  locale,
  cityLabel,
}: {
  event: PublicEvent;
  locale: string;
  cityLabel?: string | null;
}) {
  const t = await getTranslations("event");
  const tDiscover = await getTranslations("discover");
  const from = lowestPrice(event.ticketTypes);
  const date = formatPublicDate(event.startDateMs, event.timezone, locale);

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-[transform,border-color] duration-150 ease-out hover:-translate-y-0.5 hover:border-foreground/20"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            unoptimized
            sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 92vw"
            className="object-cover transition-transform duration-400 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          // No cover yet: a tinted field using the event's own accent keeps the
          // grid rhythm instead of leaving a hole.
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${event.brandingPrimary}33, transparent 70%)`,
            }}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-1">
          <h3 className="font-medium tracking-tight">{event.title}</h3>
          {event.category ? (
            <p className="text-xs text-muted-foreground">
              {t(`categories.${event.category}`)}
            </p>
          ) : null}
        </div>

        <dl className="mt-auto space-y-1.5 text-sm text-foreground/65">
          {date ? (
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 shrink-0 text-foreground/45" />
              <dd>{date}</dd>
            </div>
          ) : null}
          {cityLabel ? (
            <div className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-foreground/45" />
              <dd>{cityLabel}</dd>
            </div>
          ) : null}
        </dl>

        <Badge variant="secondary" className="w-fit">
          {from
            ? tDiscover("fromPrice", {
                price: formatPrice(from.price, from.currency, locale),
              })
            : tDiscover("free")}
        </Badge>
      </div>
    </Link>
  );
}
