import { getTranslations } from "next-intl/server";

import { AdminNav } from "@/components/navigation/admin-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { RequireAdmin } from "@/features/admin/components/require-admin";
import { Link } from "@/i18n/navigation";

/**
 * Admin console shell. Mirrors the workspace shell rather than inventing a
 * second layout language — guide 43 wants the console to feel restrained and
 * familiar, not like a different product.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tCommon = await getTranslations("common");
  const t = await getTranslations("admin");

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[90rem] items-center justify-between px-4 md:px-8">
          <div className="flex items-baseline gap-3">
            <Link href="/" className="text-base font-semibold tracking-tight">
              {tCommon("appName")}
            </Link>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              {t("badge")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors duration-[var(--motion-fast)] hover:text-foreground"
            >
              {t("nav.backToSite")}
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[90rem] flex-1 flex-col gap-8 px-4 py-8 md:px-8 lg:flex-row lg:gap-14 lg:py-12">
        <aside className="lg:w-56 lg:shrink-0">
          <AdminNav />
        </aside>
        <main className="min-w-0 flex-1">
          <RequireAdmin>{children}</RequireAdmin>
        </main>
      </div>
    </div>
  );
}
