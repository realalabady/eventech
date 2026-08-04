import { routing } from "@/i18n/routing";

/**
 * Canonical site identity.
 *
 * Every absolute URL in metadata, sitemap, robots and JSON-LD is built from
 * `siteUrl`. It comes from the environment because the same build runs on
 * previews and production, and a hardcoded host would make every preview
 * advertise production URLs as its canonicals — which is how preview
 * deployments end up outranking the real site.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://eventech-2f278.web.app"
).replace(/\/$/, "");

export const siteName = "EvenTech";

/** Anything under these prefixes is private and must never be indexed. */
export const PRIVATE_PATHS = [
  "/workspace",
  "/admin",
  "/account",
  "/bookings",
  "/tickets",
  "/organizer/new",
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
] as const;

/** Absolute URL for a locale-prefixed path. `path` must start with "/". */
export function absoluteUrl(locale: string, path = ""): string {
  const clean = path === "/" ? "" : path;
  return `${siteUrl}/${locale}${clean}`;
}

/**
 * Canonical plus `hreflang` alternates for one page.
 *
 * Both locales are always emitted, along with `x-default` pointing at the
 * default locale. Without this a bilingual site competes with itself: Google
 * treats the English and Arabic pages as duplicates rather than translations.
 */
export function localeAlternates(locale: string, path = "") {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = absoluteUrl(l, path);
  }
  languages["x-default"] = absoluteUrl(routing.defaultLocale, path);

  return {
    canonical: absoluteUrl(locale, path),
    languages,
  };
}
