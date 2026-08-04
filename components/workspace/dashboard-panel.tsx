"use client";

import {
  ArrowRight,
  CalendarRange,
  ChartLine,
  KanbanSquare,
  Plus,
  Route,
  ScanLine,
  Ticket,
  UserPlus,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/ui/skeletons";
import {
  OverviewCards,
  type OverviewMetric,
} from "@/components/workspace/overview-cards";
import {
  TaskProgressWidget,
  TopEventsWidget,
  useWidgetLabels,
} from "@/components/workspace/dashboard-widgets";
import { useOrganizationBookings } from "@/features/booking/hooks/use-bookings";
import { useEvents } from "@/features/event/hooks/use-events";
import { useOrganization } from "@/features/organization/hooks/use-organization";
import { useOrganizationTasks } from "@/features/task/hooks/use-tasks";
import { Link } from "@/i18n/navigation";
import {
  deriveMetrics,
  revenueOf,
  upcomingEvents,
} from "@/lib/dashboard-metrics";

export function DashboardPanel() {
  const t = useTranslations("organization.dashboard");
  const tCommon = useTranslations("common");
  const format = useFormatter();

  // Captured once per mount. `Date.now()` during render is non-idempotent —
  // React may re-render at any time, and a drifting "now" would silently
  // re-bucket the sparklines and reshuffle the upcoming list mid-session.
  const [now] = useState(() => Date.now());
  const widgetLabels = useWidgetLabels();

  const { organization, loading: orgLoading } = useOrganization();
  const orgId = organization?.id;

  const { events, loading: eventsLoading } = useEvents(orgId);
  const { bookings, loading: bookingsLoading } = useOrganizationBookings(orgId);
  const { tasks, loading: tasksLoading } = useOrganizationTasks(orgId);

  const loading =
    orgLoading || eventsLoading || bookingsLoading || tasksLoading;

  const metrics = useMemo<OverviewMetric[]>(() => {
    // Firestore Timestamps are flattened here so lib/dashboard-metrics stays
    // free of any Firebase dependency and can be tested without it.
    const derived = deriveMetrics(
      events.map((e) => ({
        id: e.id,
        startDateMs: e.startDate?.toMillis() ?? null,
        soldTickets: e.soldTickets,
      })),
      bookings.map((b) => ({
        status: b.status,
        amount: b.amount,
        quantity: b.quantity,
        currency: b.currency,
        createdAtMs: b.createdAt?.toMillis() ?? null,
      })),
      tasks.map((task) => ({
        status: task.status,
        createdAtMs: task.createdAt?.toMillis() ?? null,
      })),
      now,
    );

    const { currency } = revenueOf(
      bookings.map((b) => ({
        status: b.status,
        amount: b.amount,
        quantity: b.quantity,
        currency: b.currency,
        createdAtMs: b.createdAt?.toMillis() ?? null,
      })),
    );

    return derived.map((metric) =>
      metric.key === "revenue"
        ? {
            ...metric,
            formatted: format.number(metric.value, {
              style: "currency",
              currency,
              maximumFractionDigits: 0,
            }),
          }
        : metric,
    );
  }, [events, bookings, tasks, format, now]);

  const upcoming = useMemo(() => {
    const ranked = upcomingEvents(
      events.map((e) => ({
        id: e.id,
        startDateMs: e.startDate?.toMillis() ?? null,
        soldTickets: e.soldTickets,
        doc: e,
      })),
      now,
    );
    return ranked.map((r) => r.doc);
  }, [events, now]);

  // First-run: no events at all. Showing six zeroed KPI cards would read as a
  // broken dashboard rather than a new one.
  if (!loading && events.length === 0) {
    return (
      <div className="space-y-8">
        <Header t={t} />
        <EmptyState
          illustration="calendar"
          title={t("empty.title")}
          description={t("empty.description")}
          primaryAction={
            <Button nativeButton={false} render={<Link href="/workspace/events" />}>
              {t("empty.primary")}
            </Button>
          }
          secondaryAction={
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/workspace/team" />}
            >
              {t("empty.secondary")}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <Header t={t} />

      <OverviewCards
        metrics={metrics}
        loading={loading}
        label={tCommon("loading")}
      />

      <QuickActions t={t} />

      <div className="grid gap-4 xl:grid-cols-2">
        <TaskProgressWidget
          tasks={tasks}
          state={loading ? "loading" : "ready"}
          labels={widgetLabels}
        />
        <TopEventsWidget
          events={events}
          state={loading ? "loading" : "ready"}
          labels={widgetLabels}
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-h3">{t("upcoming.heading")}</h2>
          <Link
            href="/workspace/events"
            className="inline-flex items-center gap-1 text-small text-muted-foreground transition-colors duration-[var(--motion-fast)] hover:text-foreground"
          >
            {t("upcoming.viewAll")}
            <ArrowRight aria-hidden="true" className="size-3.5 rtl:rotate-180" />
          </Link>
        </div>

        {loading ? (
          <ListSkeleton label={tCommon("loading")} rows={3} />
        ) : upcoming.length === 0 ? (
          <EmptyState
            illustration="calendar"
            title={t("upcoming.empty")}
            description={t("upcoming.emptyHint")}
          />
        ) : (
          <ul className="space-y-3">
            {upcoming.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/workspace/events/${event.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-xs transition-[border-color,box-shadow,transform] duration-[var(--motion-fast)] ease-out hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md motion-reduce:hover:translate-y-0"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {event.title}
                    </span>
                    <span className="block text-small text-muted-foreground">
                      {event.startDate
                        ? format.dateTime(event.startDate.toDate(), {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : t("upcoming.noDate")}
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground rtl:rotate-180"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ProductionSections t={t} />
    </div>
  );
}

function Header({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <header className="space-y-1">
      <h1 className="text-h1">{t("title")}</h1>
      <p className="text-body text-muted-foreground">{t("subtitle")}</p>
    </header>
  );
}

function QuickActions({ t }: { t: ReturnType<typeof useTranslations> }) {
  const actions = [
    { href: "/workspace/events", key: "createEvent", icon: Plus },
    { href: "/workspace/bookings", key: "reviewBookings", icon: Ticket },
    { href: "/workspace/team", key: "inviteTeam", icon: UserPlus },
    { href: "/workspace/scanner", key: "openScanner", icon: ScanLine },
  ] as const;

  return (
    <section className="space-y-4">
      <h2 className="text-h3">{t("quickActions.heading")}</h2>
      <div className="flex flex-wrap gap-3">
        {actions.map(({ href, key, icon: Icon }) => (
          <Button
            key={key}
            variant="outline"
            nativeButton={false}
            render={<Link href={href} />}
          >
            <Icon aria-hidden="true" />
            {t(`quickActions.${key}`)}
          </Button>
        ))}
      </div>
    </section>
  );
}

/**
 * Entry points to the production surfaces rather than inline copies of them.
 *
 * TASK_06 lists analytics, timeline, kanban and calendar as dashboard sections,
 * but each already has a dedicated route. Embedding them here would mount
 * Recharts, dnd-kit and FullCalendar together on the first screen an organiser
 * sees — against the same task's "lazy load charts, memoize widgets" rule — and
 * would duplicate four working pages. The overview links into them instead.
 */
function ProductionSections({ t }: { t: ReturnType<typeof useTranslations> }) {
  const sections = [
    { href: "/workspace/analytics", key: "analytics", icon: ChartLine },
    { href: "/workspace/timeline", key: "timeline", icon: Route },
    { href: "/workspace/tasks", key: "tasks", icon: KanbanSquare },
    { href: "/workspace/calendar", key: "calendar", icon: CalendarRange },
  ] as const;

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {sections.map(({ href, key, icon: Icon }) => (
        <Link
          key={key}
          href={href}
          className="group/section flex flex-col gap-2 rounded-xl border border-border bg-card p-5 shadow-xs transition-[border-color,box-shadow,transform] duration-[var(--motion-fast)] ease-out hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md motion-reduce:hover:translate-y-0"
        >
          <span className="inline-flex items-center gap-2">
            <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
            <span className="text-h4">{t(`sections.${key}`)}</span>
          </span>
          <span className="text-small text-muted-foreground">
            {t(`sections.${key}Hint`)}
          </span>
          <span className="mt-1 inline-flex items-center gap-1 text-caption text-muted-foreground transition-colors duration-[var(--motion-fast)] group-hover/section:text-foreground">
            {t("sections.open")}
            <ArrowRight aria-hidden="true" className="size-3 rtl:rotate-180" />
          </span>
        </Link>
      ))}
    </section>
  );
}
