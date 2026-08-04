"use client";

import {
  CalendarDays,
  CalendarRange,
  ChartLine,
  KanbanSquare,
  LayoutDashboard,
  Menu,
  MessagesSquare,
  Route,
  ScanLine,
  Settings,
  Ticket,
  Users,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, usePathname } from "@/i18n/navigation";

const ITEMS = [
  // `exact` because every other href is a prefix of "/workspace" — a
  // startsWith test would light this up on all ten pages.
  { href: "/workspace", key: "dashboard", icon: LayoutDashboard, exact: true },
  { href: "/workspace/events", key: "events", icon: CalendarDays },
  { href: "/workspace/timeline", key: "timeline", icon: Route },
  { href: "/workspace/tasks", key: "tasks", icon: KanbanSquare },
  { href: "/workspace/calendar", key: "calendar", icon: CalendarRange },
  { href: "/workspace/messages", key: "messages", icon: MessagesSquare },
  { href: "/workspace/bookings", key: "bookings", icon: Ticket },
  { href: "/workspace/analytics", key: "analytics", icon: ChartLine },
  { href: "/workspace/scanner", key: "scanner", icon: ScanLine },
  { href: "/workspace/team", key: "team", icon: Users },
  { href: "/workspace/settings", key: "settings", icon: Settings },
] as const;

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

/**
 * Workspace navigation.
 *
 * Desktop (`lg`+) is a persistent sidebar. Below that it collapses to a burger
 * that opens a drawer.
 *
 * The previous mobile treatment was a horizontally scrolling strip. With eleven
 * entries that produced 1196px of content in a 336px rail, and the items pushed
 * the document itself to 414px against a 351px viewport — the whole page
 * scrolled sideways. A drawer removes the overflow entirely and shows all
 * eleven destinations at once instead of two and a half.
 */
export function WorkspaceNav() {
  const t = useTranslations("organization.nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile: burger + drawer */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="sm" aria-label={t("openMenu")}>
                <Menu aria-hidden="true" />
                {t("menuTitle")}
              </Button>
            }
          />
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>{t("menuTitle")}</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4 pb-6">
              {/* Closing on the click itself rather than reacting to the
                  pathname in an effect: the tap is the event, and syncing
                  state to a route in an effect runs a render late. */}
              <NavItems
                pathname={pathname}
                t={t}
                layoutId="workspace-nav-drawer"
                onNavigate={() => setOpen(false)}
              />
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: persistent sidebar */}
      <nav className="hidden lg:flex lg:flex-col lg:gap-1">
        <NavItems pathname={pathname} t={t} layoutId="workspace-nav-active" />
      </nav>
    </>
  );
}

/**
 * `layoutId` differs per surface on purpose. The drawer and the sidebar can be
 * mounted at the same time across a breakpoint change, and two motion elements
 * sharing one layoutId make the indicator fly between them.
 */
function NavItems({
  pathname,
  t,
  layoutId,
  onNavigate,
}: {
  pathname: string;
  t: ReturnType<typeof useTranslations>;
  layoutId: string;
  onNavigate?: () => void;
}) {
  const reduce = useReducedMotion();

  return (
    <>
      {ITEMS.map(({ href, key, icon: Icon, ...item }) => {
        const active = isActive(
          pathname,
          href,
          "exact" in item && Boolean(item.exact),
        );
        return (
          <Link
            key={key}
            href={href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className="relative flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors duration-[var(--motion-fast)] ease-out outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-[active=false]:text-muted-foreground"
            data-active={active}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
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
    </>
  );
}
