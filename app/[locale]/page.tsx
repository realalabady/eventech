import { getTranslations, setRequestLocale } from "next-intl/server";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <span className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium text-muted">
        {t("badge")}
      </span>
      <h1 className="max-w-3xl text-balance text-5xl font-semibold tracking-tight text-foreground">
        {t("title")}
      </h1>
      <p className="max-w-xl text-pretty text-lg text-muted">{t("tagline")}</p>
      <p className="text-sm text-muted">{t("status")}</p>
    </main>
  );
}
