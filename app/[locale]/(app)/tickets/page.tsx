import { getTranslations, setRequestLocale } from "next-intl/server";

import { PublicHeader } from "@/components/navigation/public-header";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { TicketWallet } from "@/features/ticket/components/ticket-wallet";

type PageProps = { params: Promise<{ locale: string }> };

export default async function TicketsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ticket.wallet");

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-8 px-4 py-12">
        <header className="space-y-2">
          <h1 className="text-h1">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </header>
        <RequireAuth>
          <TicketWallet />
        </RequireAuth>
      </main>
    </div>
  );
}
