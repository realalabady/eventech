"use client";

import { collection, doc, limit, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { getFirebaseFirestore } from "@/firebase/client";

import type {
  AdminEvent,
  AdminOrganization,
  ReportDoc,
} from "../moderation-types";

/** Same reasoning as the user cap: admin lists must not grow without bound. */
const CAP = 500;

const NO_ORGS: AdminOrganization[] = [];
const NO_EVENTS: AdminEvent[] = [];
const NO_REPORTS: ReportDoc[] = [];

type State<T> = { items: T[]; loading: boolean; failed: boolean };

/**
 * Shared shape for the admin console's list listeners.
 *
 * Each is admin-only by rule rather than by query constraint — `organizations`
 * is world-readable and `events`/`reports` both carry an `isAdmin()` branch —
 * so unlike the org-scoped lists these need no `organizationId` filter to
 * satisfy the "rules are not filters" requirement (gotcha #10).
 */
function useAdminList<T>(
  path: string,
  enabled: boolean,
  label: string,
): State<T> {
  const [snapshot, setSnapshot] = useState<{
    loaded: boolean;
    items: T[];
    failed?: boolean;
  }>({ loaded: false, items: [] });

  useEffect(() => {
    if (!enabled) return;

    return onSnapshot(
      query(collection(getFirebaseFirestore(), path), limit(CAP)),
      (result) =>
        setSnapshot({
          loaded: true,
          items: result.docs.map(
            (document) => ({ id: document.id, ...document.data() }) as T,
          ),
        }),
      (error) => {
        console.error(`${label} listener failed`, error);
        setSnapshot({ loaded: true, items: [], failed: true });
      },
    );
  }, [path, enabled, label]);

  if (!enabled) return { items: [], loading: false, failed: false };
  if (!snapshot.loaded) return { items: [], loading: true, failed: false };
  return {
    items: snapshot.items,
    loading: false,
    failed: snapshot.failed ?? false,
  };
}

export function useAdminOrganizations() {
  const { status, claims } = useAuth();
  const enabled = status === "authenticated" && claims?.role === "admin";
  const state = useAdminList<AdminOrganization>(
    "organizations",
    enabled,
    "organizations",
  );
  return {
    organizations: enabled ? state.items : NO_ORGS,
    loading: state.loading,
    failed: state.failed,
  };
}

export function useAdminEvents() {
  const { status, claims } = useAuth();
  const enabled = status === "authenticated" && claims?.role === "admin";
  const state = useAdminList<AdminEvent>("events", enabled, "admin events");
  return {
    events: enabled ? state.items : NO_EVENTS,
    loading: state.loading,
    failed: state.failed,
  };
}

export function useReports() {
  const { status, claims } = useAuth();
  const enabled = status === "authenticated" && claims?.role === "admin";
  const state = useAdminList<ReportDoc>("reports", enabled, "reports");
  return {
    reports: enabled ? state.items : NO_REPORTS,
    loading: state.loading,
    failed: state.failed,
  };
}

/**
 * Feature flags, readable by everyone including signed-out visitors — the
 * marketing pages gate on them too, so this must not require auth.
 */
export function useFeatureFlags() {
  const [flags, setFlags] = useState<Record<string, unknown> | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    return onSnapshot(
      doc(getFirebaseFirestore(), "featureFlags", "flags"),
      (snapshot) => setFlags(snapshot.data() ?? {}),
      (error) => {
        console.error("feature flags listener failed", error);
        setFailed(true);
      },
    );
  }, []);

  return { flags, loading: flags === null && !failed, failed };
}

/** Platform settings. Public for the same reason as flags. */
export function useSystemSettings() {
  const [settings, setSettings] = useState<Record<string, unknown> | null>(
    null,
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    return onSnapshot(
      doc(getFirebaseFirestore(), "systemSettings", "platform"),
      (snapshot) => setSettings(snapshot.data() ?? {}),
      (error) => {
        console.error("system settings listener failed", error);
        setFailed(true);
      },
    );
  }, []);

  return { settings, loading: settings === null && !failed, failed };
}
