import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

import { PublicHeader } from "@/components/navigation/public-header";
import { Badge } from "@/components/ui/badge";
import { DiscoveryEventCard } from "@/features/discovery/components/event-card";
import {
  getOrganizationBySlug,
  getVenue,
  listEventsByOrganization,
} from "@/features/discovery/services/public-data";

export const revalidate = 300;

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const organization = await getOrganizationBySlug(slug);
  if (!organization) return {};
  return {
    title: organization.name,
    description: organization.description ?? undefined,
  };
}

export default async function PublicOrganizerPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("publicOrganizer");
  const tEvent = await getTranslations("publicEvent");

  const organization = await getOrganizationBySlug(slug);

  if (!organization) {
    return (
      <div className="flex min-h-[100dvh] flex-col">
        <PublicHeader />
        <main className="flex flex-1 items-center justify-center px-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("notFound")}
          </h1>
        </main>
      </div>
    );
  }

  const events = await listEventsByOrganization(organization.id);
  const venueIds = [
    ...new Set(events.map((event) => event.venueId).filter(Boolean)),
  ] as string[];
  const venues = await Promise.all(venueIds.map((id) => getVenue(id)));
  const cityById = new Map(
    venues
      .filter((venue) => venue !== null)
      .map((venue) => [venue.id, venue.city]),
  );

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <PublicHeader />

      <main className="flex-1">
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-surface md:aspect-[4/1]">
          {organization.coverUrl ? (
            <Image
              src={organization.coverUrl}
              alt={organization.name}
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="mx-auto w-full max-w-[90rem] px-4 pb-24 md:px-8">
          <header className="-mt-14 flex flex-wrap items-end gap-5">
            {organization.logoUrl ? (
              <span className="relative size-24 overflow-hidden rounded-xl border border-border bg-card">
                <Image
                  src={organization.logoUrl}
                  alt={organization.name}
                  fill
                  unoptimized
                  sizes="96px"
                  className="object-cover"
                />
              </span>
            ) : null}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-h1">
                  {organization.name}
                </h1>
                {organization.verified ? (
                  <Badge variant="secondary">{tEvent("verified")}</Badge>
                ) : null}
              </div>
              {organization.description ? (
                <p className="max-w-[60ch] text-foreground/70">
                  {organization.description}
                </p>
              ) : null}
              {organization.website ? (
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-block text-sm text-muted-foreground underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline"
                >
                  {t("website")}
                </a>
              ) : null}
            </div>
          </header>

          <section className="mt-14 space-y-6">
            <h2 className="text-xl font-medium tracking-tight">
              {t("events")}
            </h2>
            {events.length === 0 ? (
              <p className="rounded-xl border border-border bg-card px-6 py-10 text-center text-muted-foreground">
                {t("noEvents")}
              </p>
            ) : (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {events.map((event) => (
                  <li key={event.id}>
                    <DiscoveryEventCard
                      event={event}
                      locale={locale}
                      cityLabel={
                        event.venueId
                          ? (cityById.get(event.venueId) ?? null)
                          : null
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
