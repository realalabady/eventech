import { getTranslations, setRequestLocale } from "next-intl/server";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { CreateOrganizationForm } from "@/features/organization/components/create-organization-form";
import { PendingInvites } from "@/features/organization/components/pending-invites";
import { Link } from "@/i18n/navigation";

type PageProps = { params: Promise<{ locale: string }> };

export default async function CreateOrganizationPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("organization.create");
  const tCommon = await getTranslations("common");

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="mx-auto flex h-16 w-full max-w-[90rem] items-center justify-between px-4 md:px-8">
        <Link href="/" className="text-base font-semibold tracking-tight">
          {tCommon("appName")}
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-16">
        <RequireAuth>
          <div className="space-y-10">
            <PendingInvites />
            <header className="space-y-2">
              <h1 className="text-h1">
                {t("title")}
              </h1>
              <p className="text-muted-foreground">{t("subtitle")}</p>
            </header>
            <CreateOrganizationForm />
          </div>
        </RequireAuth>
      </main>
    </div>
  );
}
