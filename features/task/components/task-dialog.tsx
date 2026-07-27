"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TaskPriority, TaskStatus } from "@/types/domain";

import { createTask, deleteTask, updateTask } from "../services/task-service";
import { TASK_COLUMNS, type TaskDoc } from "../types";

const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

type Props = {
  /** The task being edited, or null when creating a new one. */
  task: TaskDoc | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  organizationId: string;
};

/**
 * Create or edit a task. Deliberately small — title, status, priority and due
 * date. Assignment by name needs the member roster, which belongs to the
 * organization feature; features cannot import each other, so that waits for
 * the roster to be passed in rather than reached for.
 *
 * The form seeds itself from `task` at mount and never syncs afterwards. The
 * caller passes a `key` that changes on every open, so React remounts this with
 * fresh state — the sanctioned alternative to resetting state in an effect.
 */
export function TaskDialog({
  task,
  open,
  onOpenChange,
  eventId,
  organizationId,
}: Props) {
  const t = useTranslations("task");
  const [title, setTitle] = useState(() =>
    task?.titleKey ? t(`seeded.${task.titleKey}`) : (task?.title ?? ""),
  );
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "todo");
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? "medium",
  );
  const [dueDate, setDueDate] = useState(() =>
    task?.dueDate ? toDateInput(task.dueDate.toMillis()) : "",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSave() {
    if (!title.trim()) {
      setError("validationFailed");
      return;
    }
    setBusy(true);
    setError(null);

    const draft = {
      title: title.trim(),
      status,
      priority,
      assigneeId: task?.assigneeId ?? null,
      dueDate: dueDate ? new Date(`${dueDate}T00:00:00`).getTime() : null,
    };
    const result = task
      ? await updateTask(task.id, draft)
      : await createTask(eventId, organizationId, draft);

    setBusy(false);
    if (result.ok) {
      onOpenChange(false);
    } else {
      setError(result.errorKey);
    }
  }

  async function onDelete() {
    if (!task) return;
    setBusy(true);
    const result = await deleteTask(task.id);
    setBusy(false);
    if (result.ok) {
      onOpenChange(false);
    } else {
      setError(result.errorKey);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {task ? t("dialog.edit") : t("dialog.create")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">{t("dialog.titleLabel")}</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={140}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">
              {t("dialog.statusLabel")}
            </legend>
            <div className="flex flex-wrap gap-2">
              {TASK_COLUMNS.map((option) => (
                <Chip
                  key={option}
                  label={t(`status.${option}`)}
                  active={status === option}
                  onSelect={() => setStatus(option)}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">
              {t("dialog.priorityLabel")}
            </legend>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((option) => (
                <Chip
                  key={option}
                  label={t(`priority.${option}`)}
                  active={priority === option}
                  onSelect={() => setPriority(option)}
                />
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="task-due">{t("dialog.dueLabel")}</Label>
            <Input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>

          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {t(`errors.${error}`)}
            </p>
          ) : null}
        </div>

        <DialogFooter className="gap-2">
          {task ? (
            <Button variant="ghost" onClick={onDelete} disabled={busy}>
              {t("dialog.delete")}
            </Button>
          ) : null}
          <Button onClick={onSave} disabled={busy}>
            {t("dialog.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Chip({
  label,
  active,
  onSelect,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors duration-150 ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

/** `<input type="date">` wants YYYY-MM-DD in the viewer's own timezone. */
function toDateInput(millis: number): string {
  const date = new Date(millis);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(millis - offset).toISOString().slice(0, 10);
}
