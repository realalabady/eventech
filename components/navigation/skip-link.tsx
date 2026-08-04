"use client";

/**
 * Skip link — WCAG 2.4.1 (Bypass Blocks).
 *
 * The workspace puts eleven navigation entries ahead of page content, so a
 * keyboard user previously had to tab through all of them on every route.
 *
 * It resolves `<main>` at activation time rather than pointing at a fixed
 * `href="#id"`. There are roughly fifteen `<main>` elements across the app and
 * no shared id between them; targeting the element by role means this works on
 * every page — including ones added later — with nothing to keep in sync.
 *
 * `tabIndex = -1` is applied just before focusing because `<main>` is not
 * focusable by default, then removed on blur so it never becomes a tab stop of
 * its own.
 */
export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main"
      onClick={(event) => {
        const main = document.querySelector("main");
        if (!main) return; // Fall back to the default anchor behaviour.
        event.preventDefault();
        main.tabIndex = -1;
        main.focus();
        main.addEventListener("blur", () => main.removeAttribute("tabindex"), {
          once: true,
        });
        // Move the viewport too — focus alone does not scroll a container that
        // is already within view but visually below the header.
        main.scrollIntoView({ block: "start" });
      }}
      // Padding is applied under `focus-visible:` because Tailwind's
      // `not-sr-only` resets `padding: 0` — unprefixed `px-4 py-2` is discarded
      // the moment the link un-hides, leaving the text flush against its
      // background.
      className="sr-only rounded-md bg-primary text-sm font-medium text-primary-foreground focus-visible:not-sr-only focus-visible:absolute focus-visible:start-4 focus-visible:top-4 focus-visible:z-50 focus-visible:px-4 focus-visible:py-2 focus-visible:shadow-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {label}
    </a>
  );
}
