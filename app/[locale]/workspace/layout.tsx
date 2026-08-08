import { getTranslations } from "next-intl/server";

import { WorkspaceNav } from "@/components/navigation/workspace-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
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
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 shadow-sm backdrop-blur-md">
        <div className="flex h-16 w-full items-center justify-between px-4 md:px-6">
          <Link href="/" className="text-base font-semibold tracking-tight">
            {tCommon("appName")}
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors duration-[var(--motion-fast)] hover:text-foreground"
            >
              {tNav("backToSite")}
            </Link>
            <ThemeToggle />
            <SignOutButton className="lg:hidden" />
          </div>
        </div>
      </header>

      <div className="flex w-full flex-1 flex-col lg:flex-row">
        {/* The rail is flush to the viewport edge and separated by its own
            border + surface tint, so the nav reads as chrome rather than as
            the first column of the page content. */}
        <aside className="border-b border-border px-4 py-4 lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-e lg:overflow-y-auto lg:bg-card/40 lg:px-3 lg:py-6">
          <div className="flex h-full flex-col">
            <WorkspaceNav />
            <div className="mt-auto hidden border-t border-border pt-3 lg:block">
              <SignOutButton className="w-full justify-start px-3 text-muted-foreground hover:text-foreground" />
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-8 md:px-8 lg:py-12">
          <RequireOrganizer>{children}</RequireOrganizer>
        </main>
      </div>
    </div>
  );
}
