import { setRequestLocale } from "next-intl/server";

import { StaticPage } from "@/components/marketing/static-page";

export const dynamic = "force-static";

type PageProps = { params: Promise<{ locale: string }> };

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <StaticPage
      namespace="privacy"
      sections={["collect", "use", "processors", "retention", "rights"]}
    />
  );
}
