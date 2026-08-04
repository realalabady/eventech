import { getTranslations, setRequestLocale } from "next-intl/server";

import { LazyOrganizationSettings } from "@/features/organization/components/organization-settings-lazy";

type PageProps = { params: Promise<{ locale: string }> };

export default async function WorkspaceSettingsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("organization.settings");

  return (
    <div className="space-y-10">
      <h1 className="text-h1">{t("title")}</h1>
      <LazyOrganizationSettings />
    </div>
  );
}
