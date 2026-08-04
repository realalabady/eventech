import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Placeholder photography until real event assets exist (taste-skill §4.8).
      { protocol: "https", hostname: "picsum.photos" },
      // Event covers, organiser logos and QR assets. Without this host the
      // optimizer refuses the URL, which is why every Firebase image was being
      // rendered `unoptimized` — the original full-size JPEG was shipped to
      // every device. On /discover that made the cover the LCP element at
      // 3.9s, with 2.0s of it spent downloading one image.
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/**",
      },
    ],
    // AVIF first, WebP fallback (TASK_09). Next negotiates per request via
    // Accept, so browsers without AVIF still get WebP rather than the original.
    formats: ["image/avif", "image/webp"],
  },
};

export default withNextIntl(nextConfig);
