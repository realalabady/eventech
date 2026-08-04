import { getTranslations } from "next-intl/server";

import { ProfileSkeleton } from "@/components/ui/skeletons";

export default async function OrganizerLoading() {
  const t = await getTranslations("common");
  return (
    <div className="mx-auto w-full max-w-content px-4 py-12">
      <ProfileSkeleton label={t("loading")} />
    </div>
  );
}
