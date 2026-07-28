"use client";

import { ScrollText, Users } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";

const ITEMS = [
  { href: "/admin/users", key: "users", icon: Users },
  { href: "/admin/audit", key: "audit", icon: ScrollText },
] as const;

/**
 * Admin sidebar. Same shared-layout active indicator as the workspace nav, so
 * the two consoles feel like one product (canonical §9). More sections unlock
 * as the remaining Phase 9 slices land.
 */
export function AdminNav() {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <nav className="flex gap-1 lg:flex-col">
      {ITEMS.map(({ href, key, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={key}
            href={href}
            aria-current={active ? "page" : undefined}
            className="relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors duration-150 hover:text-foreground data-[active=false]:text-muted-foreground"
            data-active={active}
          >
            {active ? (
              <motion.span
                layoutId="admin-nav-active"
                className="absolute inset-0 -z-10 rounded-md bg-accent"
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 380, damping: 32 }
                }
              />
            ) : null}
            <Icon className="size-4 shrink-0" />
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}
