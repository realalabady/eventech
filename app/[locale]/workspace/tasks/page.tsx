import { getTranslations, setRequestLocale } from "next-intl/server";

import { TaskBoardPanel } from "@/components/workspace/task-board-panel";

type PageProps = { params: Promise<{ locale: string }> };

export default async function WorkspaceTasksPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("task.board");

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>
      <TaskBoardPanel />
    </div>
  );
}
