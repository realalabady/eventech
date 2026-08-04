import { ImageResponse } from "next/og";

import { getEventBySlug } from "@/features/discovery/services/public-data";
import { siteName, siteUrl } from "@/lib/seo/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Event preview";

/**
 * Social preview for events without a cover image.
 *
 * Events that have a cover already set it as `og:image` in generateMetadata,
 * and a real photograph beats a generated card every time. This exists so the
 * remainder still get a branded preview instead of the site-wide default —
 * which is what a link to a coverless event used to look like when shared.
 *
 * Rendered with the satori subset that `next/og` ships: flexbox only, no CSS
 * variables or Tailwind classes, and no webfont unless one is fetched here.
 * The design tokens are therefore literals from §8.
 */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug).catch(() => null);

  const title = event?.title ?? siteName;
  // Host only — the protocol is noise in a preview card.
  const displayHost = siteUrl.replace(/^https?:\/\//, "");
  const accent = event?.brandingPrimary ?? "#8b5cf6";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#0a0a0b",
          // Mirrors the app's Level-0 background wash, flattened to a single
          // gradient because satori does not composite multiple layers.
          backgroundImage: `radial-gradient(ellipse 80% 60% at 20% 0%, ${accent}33, transparent)`,
          color: "#f5f5f6",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: accent,
            }}
          />
          <div style={{ fontSize: 26, color: "#a1a1aa", letterSpacing: 1 }}>
            {siteName}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: title.length > 48 ? 64 : 84,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
            // satori has no line clamp; the substring keeps a long title from
            // overflowing the canvas.
            maxWidth: 1000,
          }}
        >
          {title.length > 90 ? `${title.slice(0, 90)}…` : title}
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#a1a1aa" }}>
          {displayHost}
        </div>
      </div>
    ),
    size,
  );
}
