"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";

const Aurora = dynamic(() => import("@/components/motion/aurora"), {
  ssr: false,
});

/**
 * Ambient stage light behind the hero: ReactBits Aurora (WebGL) tuned to the
 * brand palette, kept deliberately faint so type stays the focus. Collapses to
 * a static gradient under prefers-reduced-motion (canonical §9) and during load.
 */
export function HeroBackdrop() {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] overflow-hidden [mask-image:linear-gradient(to_bottom,black,transparent)]"
    >
      {reduce ? (
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_0%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_70%),radial-gradient(50%_50%_at_80%_5%,color-mix(in_oklab,var(--brand)_14%,transparent),transparent_70%)]" />
      ) : (
        <div className="absolute inset-0 opacity-35 blur-[2px]">
          <Aurora
            colorStops={["#3b82f6", "#8b5cf6", "#38bdf8"]}
            amplitude={0.6}
            blend={0.6}
            speed={0.4}
          />
        </div>
      )}
    </div>
  );
}
