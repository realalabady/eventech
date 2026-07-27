import { getTranslations, setRequestLocale } from "next-intl/server";

import { AnalyticsPanel } from "@/components/workspace/analytics-panel";

type PageProps = { params: Promise<{ locale: string }> };

export default async function WorkspaceAnalyticsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("analytics");

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>
      <AnalyticsPanel />
    </div>
  );
}
