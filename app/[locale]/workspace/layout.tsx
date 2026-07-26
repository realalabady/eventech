import { getTranslations } from "next-intl/server";

import { WorkspaceNav } from "@/components/navigation/workspace-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { RequireOrganizer } from "@/features/organization/components/require-organizer";
import { Link } from "@/i18n/navigation";

/**
 * Workspace shell: sidebar on desktop, horizontal nav on mobile.
 * Nothing is removed on small screens, only reorganized (guide 18).
 */
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("organization.nav");

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[90rem] items-center justify-between px-4 md:px-8">
          <Link href="/" className="text-base font-semibold tracking-tight">
            {tCommon("appName")}
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
            >
              {tNav("backToSite")}
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[90rem] flex-1 flex-col gap-8 px-4 py-8 md:px-8 lg:flex-row lg:gap-14 lg:py-12">
        <aside className="lg:w-56 lg:shrink-0">
          <WorkspaceNav />
        </aside>
        <main className="min-w-0 flex-1">
          <RequireOrganizer>{children}</RequireOrganizer>
        </main>
      </div>
    </div>
  );
}
