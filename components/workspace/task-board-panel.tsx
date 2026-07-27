"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { EventPicker } from "@/features/event/components/event-picker";
import { KanbanBoard } from "@/features/task/components/kanban-board";
import { TaskDialog } from "@/features/task/components/task-dialog";
import { useOrganizationTasks } from "@/features/task/hooks/use-tasks";
import type { TaskDoc } from "@/features/task/types";
import { useOrganization } from "@/features/organization/hooks/use-organization";

/**
 * Composition layer for the Kanban page.
 *
 * The task, event and organization features stay unaware of each other
 * (canonical §11); this is where they are wired together.
 */
export function TaskBoardPanel() {
  const t = useTranslations("task");
  const { organization } = useOrganization();
  const { tasks, loading, failed } = useOrganizationTasks(organization?.id);

  const [eventId, setEventId] = useState<string | null>(null);
  const [editing, setEditing] = useState<TaskDoc | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  // Bumped on every open so the dialog remounts with a clean form instead of
  // resurrecting an abandoned draft.
  const [session, setSession] = useState(0);

  const eventTasks = useMemo(
    () => tasks.filter((task) => task.eventId === eventId),
    [tasks, eventId],
  );

  function openNew() {
    setEditing(null);
    setSession((count) => count + 1);
    setDialogOpen(true);
  }

  function openExisting(task: TaskDoc) {
    setEditing(task);
    setSession((count) => count + 1);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <EventPicker
          organizationId={organization?.id}
          selectedId={eventId}
          onSelect={setEventId}
        />
        <Button size="sm" onClick={openNew} disabled={!eventId}>
          <Plus className="size-4" aria-hidden />
          {t("board.newTask")}
        </Button>
      </div>

      {eventId ? (
        <KanbanBoard
          tasks={eventTasks}
          loading={loading}
          failed={failed}
          onOpen={openExisting}
        />
      ) : null}

      {eventId && organization ? (
        <TaskDialog
          key={`${editing?.id ?? "new"}-${session}`}
          task={editing}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          eventId={eventId}
          organizationId={organization.id}
        />
      ) : null}
    </div>
  );
}
