import { getTranslations, setRequestLocale } from "next-intl/server";

import { TeamManager } from "@/features/organization/components/team-manager";

type PageProps = { params: Promise<{ locale: string }> };

export default async function WorkspaceTeamPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("organization.team");

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>
      <TeamManager />
    </div>
  );
}
