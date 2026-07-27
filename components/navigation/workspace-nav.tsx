"use client";

import {
  CalendarDays,
  KanbanSquare,
  Route,
  ScanLine,
  Settings,
  Ticket,
  Users,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";

const ITEMS = [
  { href: "/workspace/events", key: "events", icon: CalendarDays },
  { href: "/workspace/timeline", key: "timeline", icon: Route },
  { href: "/workspace/tasks", key: "tasks", icon: KanbanSquare },
  { href: "/workspace/bookings", key: "bookings", icon: Ticket },
  { href: "/workspace/scanner", key: "scanner", icon: ScanLine },
  { href: "/workspace/team", key: "team", icon: Users },
  { href: "/workspace/settings", key: "settings", icon: Settings },
] as const;

/**
 * Workspace sidebar. The active item is marked by a shared layout indicator
 * that slides between entries (canonical §9: motion communicates position).
 * More sections unlock as their phases land (guide 41).
 */
export function WorkspaceNav() {
  const t = useTranslations("organization.nav");
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
                layoutId="workspace-nav-active"
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
