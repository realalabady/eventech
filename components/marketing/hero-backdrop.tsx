"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

const Aurora = dynamic(() => import("@/components/motion/aurora"), {
  ssr: false,
});

/**
 * Aurora is WebGL: its shader takes literal hex, so it cannot consume a CSS
 * custom property the way every other surface does. Rather than hardcode the
 * palette here — the one thing the tokens rule forbids — the stops are read
 * back off `:root` at runtime. The tokens stay the single source of truth, and
 * a palette change in `globals.css` still reaches the shader.
 */
const STOP_TOKENS = ["--primary", "--brand", "--info"] as const;

/** Canonical §8 declares every colour token as hex, so this is a plain read. */
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * `useSyncExternalStore` compares snapshots by identity, so a fresh array on
 * every read would loop forever. The last result is cached and only replaced
 * when the values themselves change.
 */
let cached: { key: string; stops: string[] } | null = null;

function getSnapshot(): string[] | null {
  const root = getComputedStyle(document.documentElement);
  const stops = STOP_TOKENS.map((token) => root.getPropertyValue(token).trim());
  if (!stops.every((stop) => HEX.test(stop))) return null;

  const key = stops.join(",");
  if (cached?.key !== key) cached = { key, stops };
  return cached.stops;
}

/** No tokens to read while rendering on the server: the gradient stands in. */
function getServerSnapshot(): string[] | null {
  return null;
}

/**
 * Light and dark carry different values for all three tokens, and the theme
 * toggle swaps them by class — without this the shader would keep the palette
 * it mounted with.
 */
function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

/**
 * Ambient stage light behind the hero: ReactBits Aurora (WebGL) tuned to the
 * brand palette, kept deliberately faint so type stays the focus. Collapses to
 * a static gradient under prefers-reduced-motion (canonical §9), during load,
 * and if the tokens ever stop being readable as hex.
 */
export function HeroBackdrop() {
  const reduce = useReducedMotion();
  const stops = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] overflow-hidden [mask-image:linear-gradient(to_bottom,black,transparent)]"
    >
      {reduce || !stops ? (
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_0%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_70%),radial-gradient(50%_50%_at_80%_5%,color-mix(in_oklab,var(--brand)_14%,transparent),transparent_70%)]" />
      ) : (
        <div className="absolute inset-0 opacity-35 blur-[2px]">
          <Aurora colorStops={stops} amplitude={0.6} blend={0.6} speed={0.4} />
        </div>
      )}
    </div>
  );
}
