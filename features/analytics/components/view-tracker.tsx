"use client";

import { httpsCallable } from "firebase/functions";
import { useEffect } from "react";

import { getFirebaseFunctions } from "@/firebase/client";

/** Remembers which events this tab has already counted. */
const SESSION_PREFIX = "evntech:viewed:";

/**
 * Records one view of a public event page (canonical §6's `trackEventView`).
 *
 * Renders nothing. Counted once per event per browser session, because React
 * Strict Mode runs effects twice in development and a back-navigation would
 * otherwise inflate the number every time. `sessionStorage` is the right scope:
 * a genuine return visit tomorrow *is* another view.
 *
 * Failures are swallowed on purpose — this is the one call in the codebase
 * where that is correct. A view counter must never interrupt somebody reading
 * about an event, and there is nothing the visitor could do about it.
 */
export function ViewTracker({ eventId }: { eventId: string }) {
  useEffect(() => {
    const key = `${SESSION_PREFIX}${eventId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const track = httpsCallable<{ eventId: string }, unknown>(
      getFirebaseFunctions(),
      "trackEventView",
    );
    void track({ eventId }).catch(() => {
      // Deliberately silent — see above.
    });
  }, [eventId]);

  return null;
}
