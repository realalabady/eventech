"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { duration } from "@/lib/motion";

/**
 * Image that fades up from a tinted block instead of popping in.
 *
 * Next's own `placeholder="blur"` needs either a statically imported asset or a
 * precomputed `blurDataURL`. Every image here is a runtime URL the build never
 * sees, so neither is available. Rather than ship a fake blurDataURL, this
 * holds a shimmering surface underneath and fades the real image over it.
 *
 * The images themselves *are* optimized — `next.config.ts` allows the Firebase
 * Storage host, so Next serves AVIF/WebP at the requested `sizes`. Callers must
 * still pass `priority` on above-the-fold instances; a lazy LCP candidate is
 * what made /discover take 3.9s.
 *
 * Two things this has to get right, both learned the hard way:
 *
 * 1. The fade is applied via inline `style`, not a class. Callers routinely
 *    pass `transition-transform` for a hover zoom, and `cn`/tailwind-merge
 *    treats that as conflicting with `transition-opacity` and keeps only the
 *    caller's — which silently leaves the image stuck at `opacity: 0`.
 *    Inline styles cannot be merged away.
 *
 * 2. Settling is resolved through a ref callback that checks `img.complete`,
 *    not `onLoad` alone. A cached or already-decoded image can finish before
 *    React attaches the handler, so `onLoad` never fires and the image would
 *    stay invisible forever. `onError` settles too — a 404 must not leave the
 *    shimmer running, which reads as a hung page.
 */
export function BlurImage({
  className,
  wrapperClassName,
  alt,
  ...props
}: ImageProps & { wrapperClassName?: string }) {
  const [settled, setSettled] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Runs after paint, which closes the window between the ref attaching (image
  // not yet decoded, `complete` false) and `onLoad` firing. Without this a
  // cached image can finish in that gap, fire nothing, and stay at opacity 0.
  useEffect(() => {
    if (imgRef.current?.complete) setSettled(true);
  }, []);

  return (
    <span className={cn("relative block overflow-hidden", wrapperClassName)}>
      {!settled ? (
        <span
          aria-hidden="true"
          className="skeleton-shimmer absolute inset-0 block bg-muted"
        />
      ) : null}

      <Image
        {...props}
        alt={alt}
        ref={imgRef}
        onLoad={() => setSettled(true)}
        onError={() => setSettled(true)}
        className={cn("object-cover", className)}
        style={{
          ...props.style,
          opacity: settled ? 1 : 0,
          // `transform` is listed alongside `opacity` because an inline
          // `transition` replaces the class-based one wholesale — omitting it
          // would kill the hover zoom callers apply via `transition-transform`.
          // Reduced motion is still honoured: the global rule in globals.css
          // clamps `transition-duration` with `!important`, which wins here.
          transition: `opacity ${duration.base}s ease-out, transform ${duration.slow}s ease-out`,
        }}
      />
    </span>
  );
}
