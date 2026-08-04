import { getTranslations } from "next-intl/server";

import { ListSkeleton, WidgetGridSkeleton } from "@/components/ui/skeletons";

export default async function WorkspaceLoading() {
  const t = await getTranslations("common");
  return (
    <div className="space-y-10">
      <WidgetGridSkeleton label={t("loading")} count={6} />
      <ListSkeleton label={t("loading")} rows={3} />
    </div>
  );
}
