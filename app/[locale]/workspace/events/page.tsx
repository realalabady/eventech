import { setRequestLocale } from "next-intl/server";

import { EventList } from "@/features/event/components/event-list";

type PageProps = { params: Promise<{ locale: string }> };

export default async function WorkspaceEventsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <EventList />;
}
