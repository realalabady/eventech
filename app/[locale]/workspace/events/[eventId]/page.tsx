import { getTranslations, setRequestLocale } from "next-intl/server";

import { EventWizard } from "@/features/event/components/event-wizard";
import { Link } from "@/i18n/navigation";

type PageProps = {
  params: Promise<{ locale: string; eventId: string }>;
};

export default async function EventWizardPage({ params }: PageProps) {
  const { locale, eventId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("event");

  return (
    <div className="space-y-8">
      <Link
        href="/workspace/events"
        className="text-sm text-muted-foreground underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline"
      >
        {t("list.title")}
      </Link>
      <EventWizard eventId={eventId} />
    </div>
  );
}
