import { getTranslations, setRequestLocale } from "next-intl/server";

import { OrganizationSettings } from "@/features/organization/components/organization-settings";

type PageProps = { params: Promise<{ locale: string }> };

export default async function WorkspaceSettingsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("organization.settings");

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <OrganizationSettings />
    </div>
  );
}
