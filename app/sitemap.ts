import type { MetadataRoute } from "next";

import {
  listPublishedEvents,
  getOrganization,
} from "@/features/discovery/services/public-data";
import { routing } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo/site";

/**
 * Regenerated hourly. Firestore is the source of truth for what is published,
 * so a build-time-only sitemap would go stale the moment an organiser publishes
 * an event.
 */
export const revalidate = 3600;

/** Static public routes. Private paths are excluded — see lib/seo/site.ts. */
const STATIC_PATHS = [
  { path: "", priority: 1.0, changeFrequency: "daily" as const },
  { path: "/discover", priority: 0.9, changeFrequency: "hourly" as const },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
];

/**
 * Builds one entry per locale, each carrying `alternates.languages` so search
 * engines pair the translations instead of treating them as duplicates.
 */
function entriesFor(
  path: string,
  opts: {
    lastModified?: Date;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  },
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, absoluteUrl(l, path)]),
  );

  return routing.locales.map((locale) => ({
    url: absoluteUrl(locale, path),
    lastModified: opts.lastModified,
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics = STATIC_PATHS.flatMap((s) =>
    entriesFor(s.path, {
      priority: s.priority,
      changeFrequency: s.changeFrequency,
    }),
  );

  // A sitemap must never break the build or 500 the route. If Firestore is
  // unreachable the static routes are still worth serving — an incomplete
  // sitemap is far better than none.
  let events: Awaited<ReturnType<typeof listPublishedEvents>> = [];
  try {
    events = await listPublishedEvents(1000);
  } catch {
    events = [];
  }

  const eventEntries = events.flatMap((event) =>
    entriesFor(`/events/${event.slug}`, {
      lastModified: event.startDateMs ? new Date(event.startDateMs) : undefined,
      priority: 0.8,
      changeFrequency: "daily",
    }),
  );

  // Organisers are derived from published events rather than listed separately:
  // an organiser with nothing public has no page worth indexing, and this needs
  // no extra collection-wide read.
  const orgIds = [...new Set(events.map((e) => e.organizationId))];
  const orgs = await Promise.all(
    orgIds.map((id) => getOrganization(id).catch(() => null)),
  );

  const orgEntries = orgs
    .filter((org): org is NonNullable<typeof org> => Boolean(org?.slug))
    .flatMap((org) =>
      entriesFor(`/organizers/${org.slug}`, {
        priority: 0.7,
        changeFrequency: "weekly",
      }),
    );

  return [...statics, ...eventEntries, ...orgEntries];
}
