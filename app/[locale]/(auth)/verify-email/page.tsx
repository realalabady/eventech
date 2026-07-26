import { getTranslations, setRequestLocale } from "next-intl/server";

import { VerifyEmailPanel } from "@/features/auth/components/verify-email-panel";

type PageProps = { params: Promise<{ locale: string }> };

export default async function VerifyEmailPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.verify");

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      </header>
      <VerifyEmailPanel />
    </div>
  );
}
