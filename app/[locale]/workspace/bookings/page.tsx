import { getTranslations, setRequestLocale } from "next-intl/server";

import { BookingReview } from "@/features/booking/components/booking-review";

type PageProps = { params: Promise<{ locale: string }> };

export default async function WorkspaceBookingsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("booking.review");

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>
      <BookingReview />
    </div>
  );
}
