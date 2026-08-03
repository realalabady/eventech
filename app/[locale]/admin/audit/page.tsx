import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuditLog } from "@/features/admin/components/audit-log";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminAuditPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.audit");

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-h1">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>
      <AuditLog />
    </div>
  );
}
