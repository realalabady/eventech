import { getTranslations } from "next-intl/server";

import { TicketListSkeleton } from "@/components/ui/skeletons";

export default async function TicketsLoading() {
  const t = await getTranslations("common");
  return (
    <div className="mx-auto w-full max-w-content px-4 py-12">
      <TicketListSkeleton label={t("loading")} />
    </div>
  );
}
