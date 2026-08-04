import { getTranslations } from "next-intl/server";

import { EventDetailSkeleton } from "@/components/ui/skeletons";

export default async function EventDetailLoading() {
  const t = await getTranslations("common");
  return (
    <div className="mx-auto w-full max-w-content px-4 py-12">
      <EventDetailSkeleton label={t("loading")} />
    </div>
  );
}
