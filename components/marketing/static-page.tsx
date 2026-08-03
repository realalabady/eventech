import { getTranslations } from "next-intl/server";

import { PublicFooter } from "@/components/navigation/public-footer";
import { PublicHeader } from "@/components/navigation/public-header";

/**
 * Shell for the four standing marketing pages — about, contact, privacy and
 * terms. They differ only in their copy, so they share one server component
 * rather than four near-identical files: a title, an intro, and an ordered set
 * of headed sections, all resolved from `messages/`.
 *
 * The section ids are passed in rather than read from the message tree so the
 * order on the page is explicit and a missing translation fails loudly.
 */
export async function StaticPage({
  namespace,
  sections,
}: {
  namespace: "about" | "contact" | "privacy" | "terms";
  sections: readonly string[];
}) {
  const t = await getTranslations(`marketing.${namespace}`);

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <PublicHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 md:px-8 lg:py-24">
        <h1 className="text-h1">
          {t("title")}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          {t("intro")}
        </p>

        <div className="mt-14 space-y-10">
          {sections.map((section) => (
            <section key={section} className="space-y-3">
              <h2 className="text-xl font-medium tracking-tight">
                {t(`sections.${section}.heading`)}
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                {t(`sections.${section}.body`)}
              </p>
            </section>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
