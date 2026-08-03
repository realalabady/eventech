import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PublicHeader } from "@/components/navigation/public-header";
import { DiscoveryEventCard } from "@/features/discovery/components/event-card";
import {
  getArtist,
  getVenue,
  listEventsByArtist,
} from "@/features/discovery/services/public-data";

export const revalidate = 300;

type PageProps = { params: Promise<{ locale: string; artistId: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { artistId } = await params;
  const artist = await getArtist(artistId);
  return artist ? { title: artist.name } : {};
}

export default async function PublicArtistPage({ params }: PageProps) {
  const { locale, artistId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("publicArtist");

  const artist = await getArtist(artistId);

  if (!artist) {
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

  const events = await listEventsByArtist(artist.id);
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

      <main className="mx-auto w-full max-w-[90rem] flex-1 px-4 py-16 md:px-8">
        <h1 className="text-h1">{artist.name}</h1>

        <section className="mt-12 space-y-6">
          <h2 className="text-xl font-medium tracking-tight">{t("events")}</h2>
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
      </main>
    </div>
  );
}
