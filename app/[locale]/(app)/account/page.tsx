import { getTranslations, setRequestLocale } from "next-intl/server";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AccountPanel } from "@/features/auth/components/account-panel";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { Link } from "@/i18n/navigation";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AccountPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.account");
  const tCommon = await getTranslations("common");

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="mx-auto flex h-16 w-full max-w-[90rem] items-center justify-between px-4 md:px-8">
        <Link href="/" className="text-base font-semibold tracking-tight">
          {tCommon("appName")}
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-16">
        <h1 className="mb-10 text-h1">
          {t("title")}
        </h1>
        <RequireAuth>
          <AccountPanel />
        </RequireAuth>
      </main>
    </div>
  );
}
