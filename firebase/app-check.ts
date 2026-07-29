import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  type AppCheck,
} from "firebase/app-check";
import type { FirebaseApp } from "firebase/app";

import { shouldUseEmulators } from "./config";

/**
 * App Check (canonical §194: built compatible from day 1, ENFORCED at Phase 11).
 *
 * It attests that a call came from *this app* rather than a script holding a
 * copied API key. That is the layer the rate limiter cannot provide: limits
 * meter a caller, App Check decides whether the caller is the product at all.
 *
 * Silently absent without `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY`. That is
 * deliberate, not a loose end — a fresh clone, the emulator suite and CI all
 * run without a reCAPTCHA key, and failing hard there would block work that has
 * nothing to do with attestation. The server side is what actually enforces.
 */
let appCheck: AppCheck | null = null;
let attempted = false;

declare global {
  var FIREBASE_APPCHECK_DEBUG_TOKEN: string | boolean | undefined;
}

export function initializeAppCheckOnce(app: FirebaseApp): AppCheck | null {
  // SSR has no reCAPTCHA and no window to attest from; the browser attaches the
  // token on the client call that actually reaches a callable.
  if (typeof window === "undefined") return null;
  if (attempted) return appCheck;
  attempted = true;

  const siteKey = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY;
  if (!siteKey || shouldUseEmulators()) return null;

  // A debug token registered in the Firebase console lets a developer machine
  // pass enforcement without a real reCAPTCHA assessment. It must never be set
  // in a production build — anyone holding it bypasses App Check entirely.
  const debugToken = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN;
  if (debugToken) {
    globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
  }

  try {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      // Without this the token expires mid-session and calls start failing
      // after roughly an hour, which looks like an intermittent backend fault.
      isTokenAutoRefreshEnabled: true,
    });
  } catch (error) {
    // Never let attestation setup take the app down: an unenforced call is
    // still better than a blank page, and the server rejects it if enforcement
    // is on.
    console.error("App Check initialization failed", error);
    appCheck = null;
  }

  return appCheck;
}
