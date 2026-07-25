import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import { notFound } from "next/navigation";

import { Toaster } from "@/components/ui/sonner";
import { getDirection } from "@/i18n/direction";
import { routing } from "@/i18n/routing";

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
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

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
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
