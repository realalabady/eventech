import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

/**
 * Shared footer for the public site. It is the only route to about, contact,
 * privacy and terms — those pages have no place in the header, and without it
 * they would exist but be unreachable.
 */
const GROUPS = [
  {
    key: "product",
    links: [
      { key: "browse", href: "/discover" },
      { key: "signIn", href: "/login" },
    ],
  },
  {
    key: "company",
    links: [
      { key: "about", href: "/about" },
      { key: "contact", href: "/contact" },
    ],
  },
  {
    key: "legal",
    links: [
      { key: "privacy", href: "/privacy" },
      { key: "terms", href: "/terms" },
    ],
  },
] as const;

export async function PublicFooter() {
  const t = await getTranslations("marketing.footer");
  const tCommon = await getTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid w-full max-w-[90rem] gap-10 px-4 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)] md:px-8">
        <div className="space-y-3">
          <Link href="/" className="text-base font-semibold tracking-tight">
            {tCommon("appName")}
          </Link>
          <p className="max-w-[32ch] text-sm leading-relaxed text-muted-foreground">
            {t("tagline")}
          </p>
        </div>

        {GROUPS.map((group) => (
          <nav key={group.key} className="space-y-3">
            <h2 className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              {t(group.key)}
            </h2>
            <ul className="space-y-2">
              {group.links.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto w-full max-w-[90rem] px-4 pb-10 md:px-8">
        <p className="text-xs text-muted-foreground">
          {t("copyright", { app: tCommon("appName"), year })}
        </p>
      </div>
    </footer>
  );
}
