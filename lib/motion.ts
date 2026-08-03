import type { Transition, Variants } from "motion/react";

/**
 * EvenTech motion tokens — the single source for every animated value.
 *
 * Duration scale comes from NEW TASKS/TASK_01 (120/180/250/350, hard ceiling
 * 500ms), which supersedes the 100/150/250/400/600/700 scale in
 * guides/50_CANONICAL_DECISIONS.md §9. The §9 rules that TASK_01 does not
 * restate still hold: easeOut/easeInOut/spring only, and opacity/transform/
 * scale/rotate/blur are the only animatable properties.
 *
 * Values are seconds (motion/react). The CSS mirror lives in app/globals.css
 * as --motion-* custom properties so Tailwind transitions and motion/react
 * animate on one scale.
 */

/** Hard ceiling. Nothing in the app may animate longer than this. */
export const MOTION_CEILING = 0.5;

export const duration = {
  /** 120ms — press feedback, focus ring, badge swap. */
  instant: 0.12,
  /** 180ms — hover, icon swap, dropdown, tab indicator. */
  fast: 0.18,
  /** 250ms — modal, toast, card expand, accordion. */
  base: 0.25,
  /** 350ms — page transition, scroll reveal, hero entrance. */
  slow: 0.35,
} as const;

/**
 * §9 permits easeOut, easeInOut and spring only. `easeOut` is the default for
 * anything entering; `easeInOut` is reserved for reversible state (accordion,
 * sidebar collapse) where the same curve must read correctly in both directions.
 */
export const easing = {
  out: "easeOut",
  inOut: "easeInOut",
} as const;

/** Springs for gesture and layout continuity, where a duration cannot express weight. */
export const spring = {
  /** Default UI — nav indicator, tab indicator, chips. */
  snappy: { type: "spring", stiffness: 380, damping: 32 },
  /** Panels and cards landing softly — sheets, expanding cards. */
  gentle: { type: "spring", stiffness: 220, damping: 28 },
  /** Drag release — kanban cards, reorderable lists. */
  release: { type: "spring", stiffness: 260, damping: 30, restDelta: 0.001 },
} as const satisfies Record<string, Transition>;

/** Travel distances in px. Entrances stay small so reduced motion loses little. */
export const distance = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
} as const;

/** Scale factors. Card hover is TASK_01 (1.015); button hover/press is TASK_04. */
export const scale = {
  cardHover: 1.015,
  buttonHover: 1.02,
  press: 0.98,
} as const;

/** Per-child delay for staggered reveals. */
export const stagger = {
  tight: 0.04,
  base: 0.06,
  loose: 0.08,
} as const;

/* -------------------------------------------------------------------------- */
/* Shared transitions                                                          */
/* -------------------------------------------------------------------------- */

export const transition = {
  instant: { duration: duration.instant, ease: easing.out },
  fast: { duration: duration.fast, ease: easing.out },
  base: { duration: duration.base, ease: easing.out },
  slow: { duration: duration.slow, ease: easing.out },
  /** Reversible state — same curve reads correctly opening and closing. */
  reversible: { duration: duration.base, ease: easing.inOut },
} as const satisfies Record<string, Transition>;

/* -------------------------------------------------------------------------- */
/* Shared variants                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Entrance reveal. `reduce` collapses travel to zero and shortens to a fade —
 * §9 keeps small fades under reduced motion rather than removing feedback.
 */
export function fadeUp(reduce: boolean, y: number = distance.md): Variants {
  return {
    hidden: { opacity: 0, y: reduce ? 0 : y },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduce
        ? { duration: duration.fast, ease: easing.out }
        : transition.slow,
    },
  };
}

/** Container for staggered children. Pair with `fadeUp` on each item. */
export function staggerContainer(
  reduce: boolean,
  step: number = stagger.base,
): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduce ? 0 : step },
    },
  };
}

/**
 * Route transition — fade plus a scale floor small enough to read as depth
 * rather than zoom. Exit is shorter than enter so navigation never feels laggy.
 */
export function pageTransition(reduce: boolean): Variants {
  return {
    hidden: { opacity: 0, scale: reduce ? 1 : 0.99 },
    visible: { opacity: 1, scale: 1, transition: transition.slow },
    exit: {
      opacity: 0,
      scale: reduce ? 1 : 0.995,
      transition: transition.fast,
    },
  };
}

/** Overlay-backed surfaces: dialogs, sheets, command palette. */
export function overlayContent(reduce: boolean): Variants {
  return {
    hidden: { opacity: 0, scale: reduce ? 1 : 0.97, y: reduce ? 0 : distance.sm },
    visible: { opacity: 1, scale: 1, y: 0, transition: transition.base },
    exit: {
      opacity: 0,
      scale: reduce ? 1 : 0.98,
      transition: transition.fast,
    },
  };
}

/** Floating surfaces: dropdown, popover, context menu, tooltip. */
export function floatingContent(reduce: boolean): Variants {
  return {
    hidden: { opacity: 0, scale: reduce ? 1 : 0.96, y: reduce ? 0 : -distance.xs },
    visible: { opacity: 1, scale: 1, y: 0, transition: transition.fast },
    exit: { opacity: 0, scale: reduce ? 1 : 0.98, transition: transition.instant },
  };
}

/** Interactive card. Returns nothing under reduced motion so hover stays static. */
export function cardInteraction(reduce: boolean) {
  if (reduce) return {};
  return {
    whileHover: { scale: scale.cardHover, y: -distance.xs },
    whileTap: { scale: scale.press },
    transition: transition.fast,
  };
}
