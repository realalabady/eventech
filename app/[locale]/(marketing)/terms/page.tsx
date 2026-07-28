import { setRequestLocale } from "next-intl/server";

import { StaticPage } from "@/components/marketing/static-page";

export const dynamic = "force-static";

type PageProps = { params: Promise<{ locale: string }> };

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <StaticPage
      namespace="terms"
      sections={[
        "accounts",
        "organizers",
        "tickets",
        "payments",
        "conduct",
        "changes",
      ]}
    />
  );
}
