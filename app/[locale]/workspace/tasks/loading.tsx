import { getTranslations } from "next-intl/server";

import { KanbanSkeleton } from "@/components/ui/skeletons";

export default async function TasksLoading() {
  const t = await getTranslations("common");
  return <KanbanSkeleton label={t("loading")} />;
}
