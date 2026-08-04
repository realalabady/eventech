import { getTranslations } from "next-intl/server";

import { CalendarSkeleton } from "@/components/ui/skeletons";

export default async function CalendarLoading() {
  const t = await getTranslations("common");
  return <CalendarSkeleton label={t("loading")} />;
}
