import { getTranslations, setRequestLocale } from "next-intl/server";

import { PublicFooter } from "@/components/navigation/public-footer";
import { PublicHeader } from "@/components/navigation/public-header";
import { DiscoverFilters } from "@/features/discovery/components/discover-filters";
import { DiscoveryEventCard } from "@/features/discovery/components/event-card";
import {
  getVenue,
  listPublishedEvents,
} from "@/features/discovery/services/public-data";
import { EVENT_CATEGORIES } from "@/features/event/types";

// Public catalogue: revalidated rather than rendered per request (canonical §11).
export const revalidate = 300;

type PageProps = { params: Promise<{ locale: string }> };

export default async function DiscoverPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("discover");
  const tEvent = await getTranslations("event");

  const events = await listPublishedEvents();

  // Resolve each venue once so cards can show the city and search can match it.
  const venueIds = [
    ...new Set(events.map((event) => event.venueId).filter(Boolean)),
  ] as string[];
  const venues = await Promise.all(venueIds.map((id) => getVenue(id)));
  const cityById = new Map(
    venues
      .filter((venue) => venue !== null)
      .map((venue) => [venue.id, venue.city]),
  );

  const items = await Promise.all(
    events.map(async (event) => {
      const city = event.venueId ? (cityById.get(event.venueId) ?? null) : null;
      return {
        id: event.id,
        category: event.category,
        searchText: [event.title, event.description ?? "", city ?? ""]
          .join(" ")
          .toLowerCase(),
        node: (
          <DiscoveryEventCard event={event} locale={locale} cityLabel={city} />
        ),
      };
    }),
  );

  const categoryLabels = Object.fromEntries(
    EVENT_CATEGORIES.map((category) => [
      category,
      tEvent(`categories.${category}`),
    ]),
  );

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <PublicHeader />

      <main className="mx-auto w-full max-w-[90rem] flex-1 px-4 py-12 md:px-8 md:py-16">
        <header className="mb-10 space-y-2">
          <h1 className="text-h1">
            {t("title")}
          </h1>
          <p className="text-lg text-foreground/70">{t("subtitle")}</p>
        </header>

        {events.length === 0 ? (
          <p className="rounded-xl border border-border bg-card px-6 py-12 text-center text-muted-foreground">
            {t("noEvents")}
          </p>
        ) : (
          <DiscoverFilters items={items} categoryLabels={categoryLabels} />
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
