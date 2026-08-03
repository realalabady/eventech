"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { formatPublicDate } from "@/features/discovery/lib/format";

import type { TaskDoc } from "../types";
import { isOverdue } from "../types";

const PRIORITY_TONE = {
  high: "border-destructive/40 text-destructive",
  medium: "border-warning/40 text-warning",
  low: "border-border text-muted-foreground",
} as const;

/**
 * One Kanban card. Seeded tasks carry an i18n `titleKey`; user-created ones
 * carry free text — the card renders whichever is present.
 */
export function TaskCard({
  task,
  now,
  onOpen,
}: {
  task: TaskDoc;
  now: number | null;
  onOpen: (task: TaskDoc) => void;
}) {
  const t = useTranslations("task");
  const locale = useLocale();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const title = task.titleKey ? t(`seeded.${task.titleKey}`) : task.title;
  const due = task.dueDate
    ? formatPublicDate(task.dueDate.toMillis(), null, locale, "d MMM")
    : null;
  const overdue = now !== null && isOverdue(task, now);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
      // Dragging only moves transform/opacity — never layout properties (§9).
      className={`cursor-grab space-y-2 rounded-xl border border-border bg-card px-4 py-3 text-start shadow-xs transition-[border-color,opacity,box-shadow,transform] duration-[var(--motion-fast)] ease-out hover:border-foreground/20 hover:shadow-sm active:cursor-grabbing ${
        isDragging ? "z-10 scale-[1.02] opacity-90 shadow-lg motion-reduce:scale-100" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(task)}
        className="w-full rounded-sm text-start text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {title}
      </button>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={PRIORITY_TONE[task.priority]}>
          {t(`priority.${task.priority}`)}
        </Badge>
        {due ? (
          <span
            className={`text-xs ${overdue ? "text-destructive" : "text-muted-foreground"}`}
          >
            {overdue ? t("overdue", { date: due }) : due}
          </span>
        ) : null}
      </div>
    </div>
  );
}
