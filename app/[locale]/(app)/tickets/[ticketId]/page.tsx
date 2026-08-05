import { getTranslations, setRequestLocale } from "next-intl/server";

import { PublicHeader } from "@/components/navigation/public-header";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { TicketDetail } from "@/features/ticket/components/ticket-detail";
import { Link } from "@/i18n/navigation";

type PageProps = {
  params: Promise<{ locale: string; ticketId: string }>;
};

export default async function TicketDetailPage({ params }: PageProps) {
  const { locale, ticketId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ticket.wallet");

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-xl flex-1 space-y-8 px-4 py-12">
        <Link
          href="/tickets"
          className="text-sm text-muted-foreground underline-offset-4 transition-colors duration-[var(--motion-fast)] hover:text-foreground hover:underline"
        >
          {t("title")}
        </Link>
        <RequireAuth>
          <TicketDetail ticketId={ticketId} />
        </RequireAuth>
      </main>
    </div>
  );
}
