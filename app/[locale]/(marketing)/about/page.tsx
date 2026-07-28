import { setRequestLocale } from "next-intl/server";

import { StaticPage } from "@/components/marketing/static-page";

// Standing copy: nothing here is per-request, so it prerenders.
export const dynamic = "force-static";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <StaticPage namespace="about" sections={["what", "who", "how"]} />;
}
