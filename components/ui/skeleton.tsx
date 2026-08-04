import { cn } from "@/lib/utils";

/**
 * Loading placeholder.
 *
 * Marked `aria-hidden` and `role="presentation"`: a skeleton is a visual stand-in
 * with no content, so announcing it produces a burst of meaningless nodes. The
 * surrounding region is responsible for announcing "loading" once, via
 * `aria-busy` — see the skeleton compositions in `./skeletons`.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      role="presentation"
      aria-hidden="true"
      className={cn("skeleton-shimmer rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
