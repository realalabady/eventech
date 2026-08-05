import { getTranslations, setRequestLocale } from "next-intl/server";

import { PublicHeader } from "@/components/navigation/public-header";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { MyBookings } from "@/features/booking/components/my-bookings";
import { Link } from "@/i18n/navigation";

type PageProps = { params: Promise<{ locale: string }> };

export default async function MyBookingsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("booking.list");

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-8 px-4 py-12">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-h1">
              {t("title")}
            </h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Link
            href="/tickets"
            className="text-sm text-muted-foreground underline-offset-4 transition-colors duration-[var(--motion-fast)] hover:text-foreground hover:underline"
          >
            {t("viewTickets")}
          </Link>
        </header>
        <RequireAuth>
          <MyBookings />
        </RequireAuth>
      </main>
    </div>
  );
}
