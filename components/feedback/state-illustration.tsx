import { cn } from "@/lib/utils";

/**
 * Illustrations for empty and error states.
 *
 * Inline SVG rather than image assets: they inherit `currentColor`, so they
 * work in both themes without a second file, cost no network request, and
 * cannot cause layout shift. TASK_05 asks every empty state to carry an
 * illustration; shipping raster art for each would have meant 8 more fetches
 * on screens that are, by definition, already waiting on something.
 *
 * All are `aria-hidden` — the state's heading carries the meaning.
 */

export type IllustrationName =
  | "empty"
  | "search"
  | "calendar"
  | "ticket"
  | "error";

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Art({ name }: { name: IllustrationName }) {
  switch (name) {
    case "search":
      return (
        <>
          <circle cx="27" cy="27" r="14" {...STROKE} />
          <path d="M37.5 37.5 47 47" {...STROKE} />
          <path d="M21 27h12" {...STROKE} opacity="0.4" />
        </>
      );
    case "calendar":
      return (
        <>
          <rect x="10" y="14" width="44" height="40" rx="6" {...STROKE} />
          <path d="M10 26h44M22 10v8M42 10v8" {...STROKE} />
          <path d="M20 36h6M30 36h6M40 36h6M20 45h6M30 45h6" {...STROKE} opacity="0.4" />
        </>
      );
    case "ticket":
      return (
        <>
          <path
            d="M10 22a4 4 0 0 1 4-4h36a4 4 0 0 1 4 4v6a5 5 0 0 0 0 10v6a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4v-6a5 5 0 0 0 0-10z"
            {...STROKE}
          />
          <path d="M32 20v6M32 30v6M32 40v6" {...STROKE} opacity="0.4" />
        </>
      );
    case "error":
      return (
        <>
          <circle cx="32" cy="32" r="20" {...STROKE} />
          <path d="M32 22v14" {...STROKE} />
          <circle cx="32" cy="43" r="1.4" fill="currentColor" stroke="none" />
        </>
      );
    case "empty":
    default:
      return (
        <>
          <rect x="12" y="18" width="40" height="32" rx="6" {...STROKE} />
          <path d="M12 30h40" {...STROKE} />
          <path d="M20 39h10" {...STROKE} opacity="0.4" />
          <circle cx="19" cy="24" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="25" cy="24" r="1.4" fill="currentColor" stroke="none" />
        </>
      );
  }
}

export function StateIllustration({
  name = "empty",
  className,
}: {
  name?: IllustrationName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className={cn("size-16 text-muted-foreground/50", className)}
    >
      <Art name={name} />
    </svg>
  );
}
