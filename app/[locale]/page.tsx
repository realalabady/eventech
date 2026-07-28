import { getTranslations, setRequestLocale } from "next-intl/server";

import { EventPreviewCard } from "@/components/marketing/event-preview-card";
import { HeroBackdrop } from "@/components/marketing/hero-backdrop";
import BlurText from "@/components/motion/blur-text";
import { FadeIn } from "@/components/motion/fade-in";
import { PublicFooter } from "@/components/navigation/public-footer";
import { PublicHeader } from "@/components/navigation/public-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

const FEATURED_EVENTS = [
  { key: "neonCoast", seed: "evntech-neon-coast", attending: 248, offset: "" },
  {
    key: "midnight",
    seed: "evntech-midnight-frequencies",
    attending: 176,
    offset: "lg:ms-10",
  },
] as const;

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");

  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      <HeroBackdrop />

      {/*
        The shared header, not a copy of it. The inline duplicate this replaced
        had an unwired "Sign in" button and a plain <span> for the app name, so
        the only working link on the whole page went to the design showcase —
        a visitor could not reach the product from the homepage at all.
      */}
      <PublicHeader />

      <main className="relative z-10 mx-auto grid w-full max-w-[90rem] flex-1 items-center gap-16 px-4 pt-12 pb-24 md:px-8 lg:grid-cols-[1fr_24rem] lg:gap-20 lg:pt-20">
        <div className="max-w-2xl">
          <BlurText
            as="h1"
            text={t("title")}
            animateBy="words"
            delay={70}
            stepDuration={0.3}
            className="text-4xl leading-[1.1] font-semibold tracking-tight text-balance md:text-6xl"
          />

          <FadeIn delay={0.35}>
            <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-foreground/70">
              {t("tagline")}
            </p>
          </FadeIn>

          <FadeIn delay={0.5}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/register" />}
              >
                {t("cta")}
              </Button>
              <Button
                size="lg"
                variant="ghost"
                nativeButton={false}
                render={<Link href="/design" />}
              >
                {t("secondaryCta")}
              </Button>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.25} className="space-y-4">
          <h2 className="text-xs font-medium tracking-[0.14em] text-foreground/50 uppercase">
            {t("upcoming")}
          </h2>
          {FEATURED_EVENTS.map(({ key, seed, attending, offset }, index) => (
            <div key={key} className={offset}>
              <EventPreviewCard
                title={t(`events.${key}.title`)}
                date={t(`events.${key}.date`)}
                venue={t(`events.${key}.venue`)}
                attending={t("attending", { count: attending })}
                imageSeed={seed}
                priority={index === 0}
              />
            </div>
          ))}
        </FadeIn>
      </main>

      <div className="relative z-10">
        <PublicFooter />
      </div>
    </div>
  );
}
