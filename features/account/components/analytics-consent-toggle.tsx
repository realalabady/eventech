"use client";

import { useTranslations } from "next-intl";
import { useCallback, useSyncExternalStore } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { applyAnalyticsConsent } from "@/firebase/analytics";
import { getConsent, setConsent } from "@/lib/analytics/consent";

/**
 * The opt-out TASK_12 requires.
 *
 * Consent lives in localStorage, which is external to React and invisible to
 * the server. `useSyncExternalStore` is the hook built for exactly that: it
 * takes a separate server snapshot, so SSR renders the default (on) and the
 * client corrects after hydration without a mismatch — and without syncing
 * state inside an effect, which runs a render late.
 *
 * The `storage` subscription keeps two open tabs in agreement; changing the
 * setting in one updates the switch in the other.
 */
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("evntech:consent", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("evntech:consent", onChange);
  };
}

export function AnalyticsConsentToggle() {
  const t = useTranslations("account.privacy");

  const granted = useSyncExternalStore(
    subscribe,
    () => getConsent() === "granted",
    // Server snapshot: analytics defaults to on, so the markup matches what a
    // first-time visitor sees.
    () => true,
  );

  const onChange = useCallback((next: boolean) => {
    setConsent(next ? "granted" : "denied");
    applyAnalyticsConsent(next);
    // `storage` only fires in *other* tabs, so this tab needs its own signal
    // for useSyncExternalStore to re-read.
    window.dispatchEvent(new Event("evntech:consent"));
  }, []);

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-h4">{t("heading")}</h2>
        <p className="text-small text-muted-foreground">{t("hint")}</p>
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id="analytics-consent"
          checked={granted}
          onCheckedChange={onChange}
        />
        <Label htmlFor="analytics-consent">{t("toggle")}</Label>
      </div>
    </section>
  );
}
