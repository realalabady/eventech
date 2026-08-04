import type { MetadataRoute } from "next";

import { siteName } from "@/lib/seo/site";

/**
 * Web app manifest.
 *
 * `start_url` points at the default locale rather than `/` so an installed
 * shortcut lands on a real page instead of the locale redirect.
 *
 * Colours are the canonical dark-theme tokens from §8 (`--background`,
 * `--brand`). They are literals because a manifest is served as JSON and cannot
 * read CSS custom properties — if §8 changes, this changes with it.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteName} — The Operating System for Event Production`,
    short_name: siteName,
    description:
      "Plan, manage, launch, and execute events professionally. Built for the music industry first.",
    start_url: "/en",
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#0a0a0b",
    categories: ["events", "productivity", "business"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
