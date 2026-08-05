import { getTranslations } from "next-intl/server";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/** Shared header for the public marketing and discovery pages. */
export async function PublicHeader() {
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");
  const tDiscover = await getTranslations("discover");

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[90rem] items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-base font-semibold tracking-tight">
            {tCommon("appName")}
          </Link>
          <Link
            href="/discover"
            className="text-sm text-muted-foreground transition-colors duration-[var(--motion-fast)] hover:text-foreground"
          >
            {tDiscover("title")}
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            {tNav("signIn")}
          </Button>
        </div>
      </div>
    </header>
  );
}
