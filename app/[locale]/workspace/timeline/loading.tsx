import { getTranslations } from "next-intl/server";

import { TimelineSkeleton } from "@/components/ui/skeletons";

export default async function TimelineLoading() {
  const t = await getTranslations("common");
  return <TimelineSkeleton label={t("loading")} />;
}
