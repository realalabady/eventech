import { CalendarDays, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

import { PublicHeader } from "@/components/navigation/public-header";
import { ViewTracker } from "@/features/analytics/components/view-tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingRequest } from "@/features/booking/components/booking-request";
import { formatPrice, formatPublicDate } from "@/features/discovery/lib/format";
import {
  getArtists,
  getEventBySlug,
  getOrganization,
  getVenue,
} from "@/features/discovery/services/public-data";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, eventSchemaOrNull } from "@/lib/seo/json-ld";
import { absoluteUrl, localeAlternates } from "@/lib/seo/site";

export const revalidate = 300;

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const event = await getEventBySlug(slug);
  // `robots: noindex` rather than empty metadata: an unknown slug still returns
  // a rendered page, and without this it would be indexed as a thin duplicate.
  if (!event) return { robots: { index: false, follow: false } };

  const path = `/events/${event.slug}`;

  return {
    title: event.title,
    description: event.description ?? undefined,
    alternates: localeAlternates(locale, path),
    openGraph: {
      type: "article",
      url: absoluteUrl(locale, path),
      title: event.title,
      description: event.description ?? undefined,
      images: event.coverImage ? [event.coverImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description ?? undefined,
      images: event.coverImage ? [event.coverImage] : undefined,
    },
  };
}

export default async function PublicEventPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("publicEvent");
  const tEvent = await getTranslations("event");
  const tDiscover = await getTranslations("discover");

  const event = await getEventBySlug(slug);

  if (!event) {
    return (
      <div className="flex min-h-[100dvh] flex-col">
        <PublicHeader />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-h2">
            {t("notFound")}
          </h1>
          <p className="text-muted-foreground">{t("notFoundHint")}</p>
          <Button nativeButton={false} render={<Link href="/discover" />}>
            {t("backToDiscover")}
          </Button>
        </main>
      </div>
    );
  }

  const [organization, venue, artists] = await Promise.all([
    getOrganization(event.organizationId),
    event.venueId ? getVenue(event.venueId) : Promise.resolve(null),
    getArtists(event.artistIds),
  ]);

  const start = formatPublicDate(event.startDateMs, event.timezone, locale);
  const end = formatPublicDate(
    event.endDateMs,
    event.timezone,
    locale,
    "HH:mm",
  );
  const soldOut = event.availableTickets <= 0;

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Renders nothing; records one view per browser session. */}
      <ViewTracker eventId={event.id} />

      <JsonLd
        schema={eventSchemaOrNull({
          name: event.title,
          url: absoluteUrl(locale, `/events/${event.slug}`),
          startDateMs: event.startDateMs,
          endDateMs: event.endDateMs,
          description: event.description,
          image: event.coverImage,
          venue: venue
            ? { name: venue.name, address: venue.address, city: venue.city }
            : null,
          organizer: organization
            ? {
                name: organization.name,
                url: absoluteUrl(locale, `/organizers/${organization.slug}`),
              }
            : null,
          performers: artists.map((a) => ({ name: a.name })),
          offers: event.ticketTypes.map((tier) => ({
            price: tier.price,
            currency: tier.currency,
            url: absoluteUrl(locale, `/events/${event.slug}`),
          })),
          soldOut,
        })}
      />
      <JsonLd
        schema={breadcrumbSchema([
          { name: tDiscover("title"), url: absoluteUrl(locale, "/discover") },
          {
            name: event.title,
            url: absoluteUrl(locale, `/events/${event.slug}`),
          },
        ])}
      />
      <PublicHeader />

      <main className="flex-1">
        {/* Cover, tinted with the event's own accent when no image exists. */}
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-surface md:aspect-[3/1]">
          {event.coverImage ? (
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${event.brandingPrimary}40, transparent 70%)`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="mx-auto grid w-full max-w-[90rem] gap-12 px-4 pb-24 md:px-8 lg:grid-cols-[1fr_22rem] lg:gap-16">
          <div className="-mt-16 space-y-10 lg:-mt-24">
            <header className="space-y-3">
              {event.category ? (
                <Badge variant="secondary">
                  {tEvent(`categories.${event.category}`)}
                </Badge>
              ) : null}
              <h1 className="text-h1">
                {event.title}
              </h1>
            </header>

            <dl className="grid gap-6 sm:grid-cols-2">
              {start ? (
                <div className="space-y-1">
                  <dt className="text-sm text-muted-foreground">{t("when")}</dt>
                  <dd className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-foreground/45" />
                    <span>
                      {start}
                      {end ? ` – ${end}` : null}
                    </span>
                  </dd>
                </div>
              ) : null}

              {venue ? (
                <div className="space-y-1">
                  <dt className="text-sm text-muted-foreground">
                    {t("where")}
                  </dt>
                  <dd className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-foreground/45" />
                    <span>
                      {venue.name}
                      <span className="block text-sm text-muted-foreground">
                        {[venue.address, venue.city].filter(Boolean).join(", ")}
                      </span>
                    </span>
                  </dd>
                </div>
              ) : null}
            </dl>

            {event.description ? (
              <section className="space-y-3">
                <h2 className="text-h4">
                  {t("about")}
                </h2>
                <p className="max-w-[65ch] leading-relaxed text-foreground/70">
                  {event.description}
                </p>
              </section>
            ) : null}

            {artists.length > 0 ? (
              <section className="space-y-3">
                <h2 className="text-h4">
                  {t("lineup")}
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {artists.map((artist) => (
                    <li key={artist.id}>
                      <Link
                        href={`/artists/${artist.id}`}
                        className="inline-flex rounded-full border border-border px-4 py-1.5 text-sm transition-colors duration-[var(--motion-fast)] ease-out hover:border-foreground/30"
                      >
                        {artist.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {organization ? (
              <section className="space-y-3">
                <h2 className="text-h4">
                  {t("hostedBy")}
                </h2>
                <Link
                  href={`/organizers/${organization.slug}`}
                  className="inline-flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 transition-colors duration-[var(--motion-fast)] ease-out hover:border-foreground/20"
                >
                  {organization.logoUrl ? (
                    <span className="relative size-10 overflow-hidden rounded-full">
                      <Image
                        src={organization.logoUrl}
                        alt={organization.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </span>
                  ) : null}
                  <span className="font-medium">{organization.name}</span>
                  {organization.verified ? (
                    <Badge variant="secondary">{t("verified")}</Badge>
                  ) : null}
                </Link>
              </section>
            ) : null}
          </div>

          {/* Booking panel. The flow itself lands in Phase 6. */}
          <aside className="lg:sticky lg:top-24 lg:mt-8 lg:self-start">
            <div className="space-y-5 rounded-xl border border-border bg-card p-6">
              <h2 className="text-h4">
                {t("tickets")}
              </h2>

              <ul className="space-y-3">
                {event.ticketTypes.map((type) => (
                  <li
                    key={type.id}
                    className="flex items-baseline justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{type.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("remaining", {
                          count: Math.max(type.quantity - type.sold, 0),
                        })}
                      </p>
                    </div>
                    <p className="font-mono">
                      {type.price > 0
                        ? formatPrice(type.price, type.currency, locale)
                        : tDiscover("free")}
                    </p>
                  </li>
                ))}
              </ul>

              <BookingRequest
                eventId={event.id}
                soldOut={soldOut}
                bookingOpen={event.bookingOpen}
                ticketTypes={event.ticketTypes.map((type) => ({
                  id: type.id,
                  name: type.name,
                  price: type.price,
                  currency: type.currency,
                  remaining: Math.max(type.quantity - type.sold, 0),
                }))}
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
