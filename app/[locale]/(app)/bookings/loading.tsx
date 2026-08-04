import { getTranslations } from "next-intl/server";

import { ListSkeleton } from "@/components/ui/skeletons";

export default async function BookingsLoading() {
  const t = await getTranslations("common");
  return (
    <div className="mx-auto w-full max-w-content px-4 py-12">
      <ListSkeleton label={t("loading")} />
    </div>
  );
}
