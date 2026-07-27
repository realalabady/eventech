import { getTranslations, setRequestLocale } from "next-intl/server";

import { TicketScanner } from "@/features/scanner/components/ticket-scanner";

type PageProps = { params: Promise<{ locale: string }> };

export default async function WorkspaceScannerPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("scanner");

  return (
    // Narrow on purpose: this is worked one-handed on a phone at a door, even
    // though the rest of the workspace is desktop-first (canonical §11).
    <div className="mx-auto max-w-md space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>
      <TicketScanner />
    </div>
  );
}
