import { getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/**
 * Localized 404. Uses the locale-aware `Link` so the way out preserves the
 * language the user was already in — a plain `/` would drop an Arabic visitor
 * onto the default locale.
 *
 * Rendered as an empty state rather than an error state: a mistyped URL is not
 * a failure of the app, and the destructive-red treatment would overstate it.
 */
export default async function LocaleNotFound() {
  const t = await getTranslations("common");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col justify-center px-4 py-24">
      <EmptyState
        illustration="search"
        title={t("notFoundTitle")}
        description={t("notFoundDescription")}
        primaryAction={
          <Button nativeButton={false} render={<Link href="/" />}>
            {t("backHome")}
          </Button>
        }
      />
    </div>
  );
}
