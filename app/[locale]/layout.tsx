import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import { notFound } from "next/navigation";

import { SkipLink } from "@/components/navigation/skip-link";
import { JsonLd } from "@/components/seo/json-ld";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import { getDirection } from "@/i18n/direction";
import { routing } from "@/i18n/routing";
import { websiteSchema } from "@/lib/seo/json-ld";
import {
  absoluteUrl,
  localeAlternates,
  siteName,
  siteUrl,
} from "@/lib/seo/site";

import "../globals.css";

/**
 * Dark is the default theme; this pre-hydration script removes the `dark`
 * class before first paint when the user chose light (or system+light),
 * preventing a theme flash. Storage key must match store/theme-store.ts.
 */
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("evntech-theme");var l=window.matchMedia("(prefers-color-scheme: light)").matches;if(t==="light"||(t==="system"&&l)){document.documentElement.classList.remove("dark")}}catch(e){}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
});

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Omit<LocaleLayoutProps, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    // Makes every relative URL below resolve absolutely. Without it Next emits
    // relative og:image/canonical values, which crawlers and social scrapers
    // cannot follow.
    metadataBase: new URL(siteUrl),
    title: {
      default: t("title"),
      // Child pages set only their own name; the suffix is applied here so it
      // can never drift between routes.
      template: `%s — ${siteName}`,
    },
    description: t("description"),
    applicationName: siteName,
    category: "events",
    alternates: localeAlternates(locale),
    openGraph: {
      type: "website",
      siteName,
      locale,
      url: absoluteUrl(locale),
      title: t("title"),
      description: t("description"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        // Lets Google show full-size image and video previews rather than
        // truncating them.
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  // Matches the dark `--background` token; dark is the default experience.
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
  ],
  colorScheme: "dark light",
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations("common");

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansArabic.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <NextIntlClientProvider>
          <AuthProvider>
            {/* Site-wide WebSite + SearchAction. Renders no DOM, so it does
                not affect the tab order below. */}
            <JsonLd schema={websiteSchema(locale)} />
            {/* First focusable element on every page, so the very first Tab
                offers a way past the navigation (WCAG 2.4.1). */}
            <SkipLink label={t("skipToContent")} />
            {children}
            <Toaster />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
