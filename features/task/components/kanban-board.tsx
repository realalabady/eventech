"use client";

import {
  DndContext,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useNow } from "@/hooks/use-now";
import type { TaskStatus } from "@/types/domain";

import { updateTask } from "../services/task-service";
import { compareTasks, TASK_COLUMNS, type TaskDoc } from "../types";
import { TaskCard } from "./task-card";

/**
 * Kanban over the four canonical task statuses (§4).
 *
 * Optimistic: a dropped card moves immediately and the callable follows.
 * Canonical §11 permits this for kanban specifically — unlike approvals or QR,
 * a wrong column is cheap and self-corrects when the listener catches up. If
 * the call fails the override is dropped, so the card springs back.
 */
export function KanbanBoard({
  tasks,
  loading,
  failed,
  onOpen,
}: {
  tasks: TaskDoc[];
  loading: boolean;
  failed: boolean;
  onOpen: (task: TaskDoc) => void;
}) {
  const t = useTranslations("task");
  const now = useNow();
  const [pending, setPending] = useState<Record<string, TaskStatus>>({});
  const [error, setError] = useState<string | null>(null);

  // Dragging must not swallow the click that opens a task, so require movement.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const columns = useMemo(() => {
    const grouped: Record<TaskStatus, TaskDoc[]> = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };
    for (const task of tasks) {
      grouped[pending[task.id] ?? task.status].push(task);
    }
    for (const list of Object.values(grouped)) list.sort(compareTasks);
    return grouped;
  }, [tasks, pending]);

  async function onDragEnd(event: DragEndEvent) {
    const taskId = String(event.active.id);
    const target = resolveColumn(event, tasks, pending);
    if (!target) return;

    const task = tasks.find((candidate) => candidate.id === taskId);
    if (!task || (pending[taskId] ?? task.status) === target) return;

    setPending((current) => ({ ...current, [taskId]: target }));
    setError(null);

    const result = await updateTask(taskId, { status: target });
    if (!result.ok) {
      setError(result.errorKey);
    }
    // Drop the override either way: on success the listener now holds the
    // truth, on failure the card must snap back rather than lie.
    setPending((current) => {
      const next = { ...current };
      delete next[taskId];
      return next;
    });
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TASK_COLUMNS.map((column) => (
          <Skeleton key={column} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (failed) {
    return (
      <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {t("board.failed")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t(`errors.${error}`)}
        </p>
      ) : null}

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {TASK_COLUMNS.map((column) => (
            <Column
              key={column}
              status={column}
              tasks={columns[column]}
              now={now}
              onOpen={onOpen}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

function Column({
  status,
  tasks,
  now,
  onOpen,
}: {
  status: TaskStatus;
  tasks: TaskDoc[];
  now: number | null;
  onOpen: (task: TaskDoc) => void;
}) {
  const t = useTranslations("task");
  const { setNodeRef, isOver } = useDroppable({ id: `column:${status}` });

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-48 flex-col gap-3 rounded-2xl border p-3 transition-colors duration-150 ${
        isOver ? "border-primary/50 bg-primary/5" : "border-border bg-surface"
      }`}
    >
      <header className="flex items-center justify-between px-1">
        <h3 className="text-sm font-medium">{t(`status.${status}`)}</h3>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </header>

      <SortableContext items={tasks.map((task) => task.id)}>
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} now={now} onOpen={onOpen} />
          ))}
        </div>
      </SortableContext>

      {tasks.length === 0 ? (
        <p className="px-1 py-6 text-center text-xs text-muted-foreground">
          {t("board.emptyColumn")}
        </p>
      ) : null}
    </section>
  );
}

/**
 * A card can be dropped on a column or on another card; resolve both to a
 * status. Returns null when the drop landed outside the board.
 */
function resolveColumn(
  event: DragEndEvent,
  tasks: TaskDoc[],
  pending: Record<string, TaskStatus>,
): TaskStatus | null {
  const overId = event.over?.id;
  if (!overId) return null;

  const raw = String(overId);
  if (raw.startsWith("column:")) {
    return raw.slice("column:".length) as TaskStatus;
  }

  const overTask = tasks.find((task) => task.id === raw);
  return overTask ? (pending[overTask.id] ?? overTask.status) : null;
}
