import { setRequestLocale } from "next-intl/server";

import { DashboardPanel } from "@/components/workspace/dashboard-panel";

/**
 * Organiser dashboard — the workspace index.
 *
 * `/workspace` previously had no page at all: the layout existed, every feature
 * had its own route, but the root 404'd. This is the overview TASK_06 asks for.
 */
export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DashboardPanel />;
}
