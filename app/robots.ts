import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { PRIVATE_PATHS, siteUrl } from "@/lib/seo/site";

/**
 * Every private prefix is disallowed under each locale, because the routes are
 * locale-prefixed: `/workspace` alone would not match `/en/workspace`.
 *
 * This keeps crawlers out; it is not an access control. The workspace is
 * protected by `RequireOrganizer` and Firestore rules — robots.txt is a public
 * file and listing a path here advertises that it exists.
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = routing.locales.flatMap((locale) =>
    PRIVATE_PATHS.map((path) => `/${locale}${path}`),
  );

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...disallow, "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
