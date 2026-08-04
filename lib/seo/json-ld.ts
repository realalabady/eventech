import { absoluteUrl, siteName, siteUrl } from "./site";

/**
 * schema.org builders.
 *
 * Returned as plain objects rather than strings so callers can compose them
 * and so the values are serialized exactly once, by the component that renders
 * them. Every builder omits empty fields instead of emitting `null` — Google
 * treats a present-but-empty property as malformed, which is worse than an
 * absent one.
 */

type Json = Record<string, unknown>;

/** Drops undefined/null/empty-string entries so no blank property is emitted. */
function compact(obj: Json): Json {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== undefined && v !== null && v !== "",
    ),
  );
}

export function websiteSchema(locale: string): Json {
  return compact({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: absoluteUrl(locale),
    inLanguage: locale,
    // Lets Google render a search box for the site in results.
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl(locale, "/discover")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  });
}

export function organizationSchema(input: {
  name: string;
  url: string;
  logoUrl?: string | null;
  description?: string | null;
}): Json {
  return compact({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: input.name,
    url: input.url,
    logo: input.logoUrl ?? undefined,
    description: input.description ?? undefined,
  });
}

export function personSchema(input: {
  name: string;
  url: string;
  image?: string | null;
}): Json {
  return compact({
    "@context": "https://schema.org",
    "@type": "Person",
    name: input.name,
    url: input.url,
    image: input.image ?? undefined,
  });
}

/**
 * Event schema.
 *
 * `startDate`/`endDate` must be ISO 8601. Google rejects an Event without a
 * start date outright, so a missing one drops the whole block rather than
 * emitting an invalid entity — see `eventSchemaOrNull`.
 */
export function eventSchemaOrNull(input: {
  name: string;
  url: string;
  startDateMs: number | null;
  endDateMs?: number | null;
  description?: string | null;
  image?: string | null;
  venue?: { name: string; address?: string | null; city?: string | null } | null;
  organizer?: { name: string; url: string } | null;
  performers?: Array<{ name: string }>;
  offers?: Array<{ price: number; currency: string; url: string }>;
  soldOut?: boolean;
}): Json | null {
  if (!input.startDateMs) return null;

  return compact({
    "@context": "https://schema.org",
    "@type": "Event",
    name: input.name,
    url: input.url,
    startDate: new Date(input.startDateMs).toISOString(),
    endDate: input.endDateMs
      ? new Date(input.endDateMs).toISOString()
      : undefined,
    description: input.description ?? undefined,
    image: input.image ?? undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: input.venue
      ? compact({
          "@type": "Place",
          name: input.venue.name,
          address: compact({
            "@type": "PostalAddress",
            streetAddress: input.venue.address ?? undefined,
            addressLocality: input.venue.city ?? undefined,
          }),
        })
      : undefined,
    organizer: input.organizer
      ? { "@type": "Organization", name: input.organizer.name, url: input.organizer.url }
      : undefined,
    performer: input.performers?.length
      ? input.performers.map((p) => ({ "@type": "PerformingGroup", name: p.name }))
      : undefined,
    offers: input.offers?.length
      ? input.offers.map((o) =>
          compact({
            "@type": "Offer",
            price: o.price,
            priceCurrency: o.currency,
            url: o.url,
            availability: input.soldOut
              ? "https://schema.org/SoldOut"
              : "https://schema.org/InStock",
          }),
        )
      : undefined,
  });
}

/** Trail of ancestors. `items` must be ordered root-first. */
export function breadcrumbSchema(
  items: Array<{ name: string; url: string }>,
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqSchema(
  entries: Array<{ question: string; answer: string }>,
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: { "@type": "Answer", text: e.answer },
    })),
  };
}

export { siteUrl };
