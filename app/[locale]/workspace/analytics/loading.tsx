import { getTranslations } from "next-intl/server";

import { ChartSkeleton, WidgetGridSkeleton } from "@/components/ui/skeletons";

/**
 * Widgets and charts stream as separate regions so the tiles can paint before
 * the heavier chart query resolves — TASK_05's "widgets should load
 * independently, avoid blocking the whole dashboard".
 */
export default async function AnalyticsLoading() {
  const t = await getTranslations("common");
  return (
    <div className="space-y-8">
      <WidgetGridSkeleton label={t("loading")} />
      <ChartSkeleton label={t("loading")} />
    </div>
  );
}
