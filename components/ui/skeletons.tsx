import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Composed skeletons — one per surface TASK_05 names.
 *
 * Every shape mirrors the real component's geometry (same radius, same row
 * heights, same gaps) because the point of a skeleton is that nothing moves
 * when data arrives. A generic grey box that gets replaced by a taller card is
 * a layout shift wearing a skeleton costume.
 *
 * Each composition wraps its children in a region carrying `aria-busy` and a
 * single translated label, so assistive tech hears "loading" once instead of
 * once per bar. Callers pass the label — this file has no `useTranslations`
 * so it can stay a server component.
 */

type SkeletonRegionProps = {
  /** Already-translated status text, e.g. t("common.loading"). */
  label: string;
  className?: string;
  children: React.ReactNode;
};

function SkeletonRegion({ label, className, children }: SkeletonRegionProps) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** Mirrors DiscoveryEventCard: 16/10 media block, title, two meta rows, badge. */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs",
        className,
      )}
    >
      <Skeleton className="aspect-[16/10] rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
        <div className="mt-auto space-y-1.5">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/5" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({
  label,
  count = 6,
  className,
}: {
  label: string;
  count?: number;
  className?: string;
}) {
  return (
    <SkeletonRegion
      label={label}
      className={cn(
        "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </SkeletonRegion>
  );
}

/** Header row plus body rows, matching the table's own row rhythm. */
export function TableSkeleton({
  label,
  rows = 6,
  columns = 4,
  className,
}: {
  label: string;
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <SkeletonRegion
      label={label}
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-xs",
        className,
      )}
    >
      <div className="flex gap-4 border-b border-border px-6 py-3">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div
          key={r}
          className="flex gap-4 px-6 py-4 not-last:border-b not-last:border-border"
        >
          {Array.from({ length: columns }, (_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </SkeletonRegion>
  );
}

/** Metric tile: label, big number, trend line. Matches metric-tiles geometry. */
export function WidgetSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "space-y-3 rounded-xl border border-border bg-card p-6 shadow-xs",
        className,
      )}
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function WidgetGridSkeleton({
  label,
  count = 4,
  className,
}: {
  label: string;
  count?: number;
  className?: string;
}) {
  return (
    <SkeletonRegion
      label={label}
      className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}
    >
      {Array.from({ length: count }, (_, i) => (
        <WidgetSkeleton key={i} />
      ))}
    </SkeletonRegion>
  );
}

/**
 * Chart. The bars are given varied heights rather than a uniform block — a flat
 * grey rectangle reads as a broken image, while an uneven silhouette reads as
 * data that has not arrived.
 */
export function ChartSkeleton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const heights = ["40%", "65%", "35%", "80%", "55%", "70%", "45%"];
  return (
    <SkeletonRegion
      label={label}
      className={cn(
        "space-y-4 rounded-xl border border-border bg-card p-6 shadow-xs",
        className,
      )}
    >
      <Skeleton className="h-4 w-32" />
      <div className="flex h-40 items-end gap-3">
        {heights.map((h, i) => (
          <Skeleton key={i} className="flex-1" style={{ height: h }} />
        ))}
      </div>
    </SkeletonRegion>
  );
}

/** Avatar + name + meta, then a detail block. Used for profile and organizer. */
export function ProfileSkeleton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <SkeletonRegion label={label} className={cn("space-y-6", className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </SkeletonRegion>
  );
}

/** Generic stacked rows — lists, activity feed, notifications. */
export function ListSkeleton({
  label,
  rows = 5,
  className,
}: {
  label: string;
  rows?: number;
  className?: string;
}) {
  return (
    <SkeletonRegion label={label} className={cn("space-y-3", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-xs"
        >
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </SkeletonRegion>
  );
}

/** Label + control pairs, ending in a pill-shaped submit. */
export function FormSkeleton({
  label,
  fields = 4,
  className,
}: {
  label: string;
  fields?: number;
  className?: string;
}) {
  return (
    <SkeletonRegion label={label} className={cn("space-y-5", className)}>
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
      ))}
      <Skeleton className="h-11 w-32 rounded-full" />
    </SkeletonRegion>
  );
}

/** Month grid — 7 columns, 5 rows, matching FullCalendar's dayGrid. */
export function CalendarSkeleton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <SkeletonRegion
      label={label}
      className={cn(
        "space-y-4 rounded-xl border border-border bg-card p-6 shadow-xs",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 35 }, (_, i) => (
          <Skeleton key={i} className="aspect-square rounded-sm" />
        ))}
      </div>
    </SkeletonRegion>
  );
}

/** Progress bar plus stepped milestone rows. */
export function TimelineSkeleton({
  label,
  steps = 5,
  className,
}: {
  label: string;
  steps?: number;
  className?: string;
}) {
  return (
    <SkeletonRegion label={label} className={cn("space-y-4", className)}>
      <Skeleton className="h-1.5 w-full rounded-full" />
      {Array.from({ length: steps }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3">
          <Skeleton className="size-6 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

/** Columns of stacked cards, matching the kanban board's own column shell. */
export function KanbanSkeleton({
  label,
  columns = 4,
  className,
}: {
  label: string;
  columns?: number;
  className?: string;
}) {
  return (
    <SkeletonRegion
      label={label}
      className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-4", className)}
    >
      {Array.from({ length: columns }, (_, c) => (
        <div
          key={c}
          className="flex min-h-48 flex-col gap-3 rounded-2xl border border-border bg-surface p-3"
        >
          <div className="flex items-center justify-between px-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-6" />
          </div>
          {Array.from({ length: 2 }, (_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ))}
    </SkeletonRegion>
  );
}

/** Ticket: QR block plus event meta. */
export function TicketSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "space-y-4 rounded-xl border border-border bg-card p-6 shadow-xs",
        className,
      )}
    >
      <Skeleton className="mx-auto aspect-square w-40 rounded-lg" />
      <div className="space-y-2 text-center">
        <Skeleton className="mx-auto h-5 w-48" />
        <Skeleton className="mx-auto h-4 w-32" />
      </div>
    </div>
  );
}

export function TicketListSkeleton({
  label,
  count = 3,
  className,
}: {
  label: string;
  count?: number;
  className?: string;
}) {
  return (
    <SkeletonRegion
      label={label}
      className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}
    >
      {Array.from({ length: count }, (_, i) => (
        <TicketSkeleton key={i} />
      ))}
    </SkeletonRegion>
  );
}

/** Event detail page: hero media, title block, body, aside. */
export function EventDetailSkeleton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <SkeletonRegion label={label} className={cn("space-y-8", className)}>
      <Skeleton className="aspect-[21/9] w-full rounded-xl" />
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-card p-6 shadow-xs">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-11 w-full rounded-full" />
        </div>
      </div>
    </SkeletonRegion>
  );
}
