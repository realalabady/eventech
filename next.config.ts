import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Placeholder photography until real event assets exist (taste-skill §4.8).
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default withNextIntl(nextConfig);
