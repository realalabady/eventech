import { setRequestLocale } from "next-intl/server";

import { StaticPage } from "@/components/marketing/static-page";

export const dynamic = "force-static";

type PageProps = { params: Promise<{ locale: string }> };

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <StaticPage
      namespace="contact"
      sections={["support", "organizers", "feedback"]}
    />
  );
}
