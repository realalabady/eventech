/* eslint-disable react/jsx-no-literals --
 * The zero-hardcoded-strings rule cannot apply here. This component REPLACES
 * the root layout, so `NextIntlClientProvider` does not exist above it and
 * `useTranslations` would throw — inside the very boundary meant to catch
 * throws. Reading `messages/*.json` directly is no better: the failure this
 * handles includes "the locale layout could not load".
 *
 * Scope is three short strings on a screen that only appears when the app is
 * already broken. English-only is the deliberate trade.
 */
"use client";

import { useEffect } from "react";

/**
 * Root error boundary — the last one before Next's built-in screen.
 *
 * `app/[locale]/error.tsx` catches errors inside a page. This catches errors in
 * the ROOT LAYOUT itself: a failed font load, a broken provider, a throw in
 * `generateMetadata`. That boundary cannot help there, because the layout it
 * lives inside is the thing that failed.
 *
 * It therefore has to render its own `<html>` and `<body>` — it REPLACES the
 * root layout rather than rendering inside it. For the same reason it cannot
 * use `next-intl` (the provider is in the layout that just died), `next/font`,
 * or any design token from globals.css, since the stylesheet import lives in
 * that layout too. Everything here is inline and English-only, deliberately.
 *
 * If this screen ever renders, something is badly wrong — it is a last resort,
 * not a UX surface.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // `digest` is the only correlator available in a production build, where
    // the message is redacted. It ties this screen to the server-side log.
    console.error("[global-error]", error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          // Literals, not tokens: globals.css is imported by the layout that
          // failed, so no custom property is guaranteed to resolve here.
          backgroundColor: "#0a0a0b",
          color: "#f5f5f6",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <main style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 8px" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "#a1a1aa", margin: "0 0 24px" }}>
            The page could not be loaded. The problem has been logged.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              appearance: "none",
              border: 0,
              borderRadius: 999,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              backgroundColor: "#3b82f6",
              color: "#0a0a0b",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
