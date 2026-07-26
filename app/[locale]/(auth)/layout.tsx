import { getTranslations } from "next-intl/server";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Link } from "@/i18n/navigation";

/**
 * Auth shell: one calm, centred column. Surface hierarchy is
 * background → card, with the page kept quiet so the form is the only focus.
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tCommon = await getTranslations("common");

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="mx-auto flex h-16 w-full max-w-[90rem] items-center justify-between px-4 md:px-8">
        <Link href="/" className="text-base font-semibold tracking-tight">
          {tCommon("appName")}
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
