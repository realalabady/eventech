import { getTranslations, setRequestLocale } from "next-intl/server";

import { PublicHeader } from "@/components/navigation/public-header";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { BookingDetail } from "@/features/booking/components/booking-detail";
import { Link } from "@/i18n/navigation";

type PageProps = {
  params: Promise<{ locale: string; bookingId: string }>;
};

export default async function BookingDetailPage({ params }: PageProps) {
  const { locale, bookingId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("booking.list");

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-xl flex-1 space-y-8 px-4 py-12">
        <Link
          href="/bookings"
          className="text-sm text-muted-foreground underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline"
        >
          {t("title")}
        </Link>
        <RequireAuth>
          <BookingDetail bookingId={bookingId} />
        </RequireAuth>
      </main>
    </div>
  );
}
