import { getTranslations } from "next-intl/server";

import { CardGridSkeleton } from "@/components/ui/skeletons";

/**
 * Streamed while discovery's Firestore query resolves. Without this the route
 * showed nothing until the data landed; the grid now reserves its real
 * geometry, so cards do not shift the page when they arrive.
 */
export default async function DiscoverLoading() {
  const t = await getTranslations("common");
  return (
    <div className="mx-auto w-full max-w-content px-4 py-12">
      <CardGridSkeleton label={t("loading")} />
    </div>
  );
}
