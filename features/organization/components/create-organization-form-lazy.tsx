"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

import { FormSkeleton } from "@/components/ui/skeletons";

/**
 * Lazy boundary for CreateOrganizationForm.
 *
 * The form's zod schema was reaching the shared vendor chunk, so every page in
 * the app — including public ones with no forms — shipped ~989KB of zod. A
 * dynamic import moves it to an async chunk that only this route fetches.
 *
 * `ssr` stays at its default so the markup is still server-rendered; only the
 * client bundle is split.
 */
const Lazy = dynamic(
  () => import("./create-organization-form").then((m) => m.CreateOrganizationForm),
  { loading: () => <Fallback /> },
);

function Fallback() {
  const t = useTranslations("common");
  return <FormSkeleton label={t("loading")} fields={3} />;
}

export function LazyCreateOrganizationForm(props: React.ComponentProps<typeof Lazy>) {
  return <Lazy {...props} />;
}
