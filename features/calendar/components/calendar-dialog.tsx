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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
} from "../services/calendar-service";
import {
  CALENDAR_KINDS,
  type CalendarEntryDoc,
  type CalendarKind,
} from "../types";

type Props = {
  /** The entry being edited, or null when creating one. */
  entry: CalendarEntryDoc | null;
  /** Seed for a new entry, from the clicked cell. */
  initialStart: number | null;
  initialAllDay: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  /**
   * Events a new entry may be attached to, passed in as plain data. The calendar
   * feature must not reach into the event feature (canonical §11), so the
   * composition layer resolves these and hands them over.
   */
  eventOptions: { id: string; title: string }[];
};

/**
 * Create or edit a calendar entry.
 *
 * Like the task dialog, the form seeds itself at mount and never syncs after.
 * The caller changes the `key` on every open so React remounts it with fresh
 * state — resetting via an effect is a hard lint error here (gotcha #9).
 */
export function CalendarDialog({
  entry,
  initialStart,
  initialAllDay,
  open,
  onOpenChange,
  organizationId,
  eventOptions,
}: Props) {
  const t = useTranslations("calendar");
  const [title, setTitle] = useState(entry?.title ?? "");
  const [eventId, setEventId] = useState(entry?.eventId ?? "");
  const [kind, setKind] = useState<CalendarKind>(entry?.kind ?? "meeting");
  const [allDay, setAllDay] = useState(entry?.allDay ?? initialAllDay);
  const [start, setStart] = useState(() =>
    toLocalInput(entry?.startAt?.toMillis() ?? initialStart),
  );
  const [end, setEnd] = useState(() =>
    toLocalInput(entry?.endAt?.toMillis() ?? null),
  );
  const [location, setLocation] = useState(entry?.location ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSave() {
    const startMillis = fromLocalInput(start);
    if (!title.trim() || startMillis === null) {
      setError("validationFailed");
      return;
    }
    const endMillis = fromLocalInput(end);
    if (endMillis !== null && endMillis < startMillis) {
      setError("validationFailed");
      return;
    }

    setBusy(true);
    setError(null);

    const draft = {
      title: title.trim(),
      kind,
      startAt: startMillis,
      endAt: endMillis,
      allDay,
      location: location.trim() || null,
    };
    const result = entry
      ? await updateCalendarEvent(entry.id, draft)
      : await createCalendarEvent(organizationId, {
          ...draft,
          eventId: eventId || null,
        });

    setBusy(false);
    if (result.ok) {
      onOpenChange(false);
    } else {
      setError(result.errorKey);
    }
  }

  async function onDelete() {
    if (!entry) return;
    setBusy(true);
    const result = await deleteCalendarEvent(entry.id);
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
            {entry ? t("dialog.edit") : t("dialog.create")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="calendar-title">{t("dialog.titleLabel")}</Label>
            <Input
              id="calendar-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={140}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">
              {t("dialog.kindLabel")}
            </legend>
            <div className="flex flex-wrap gap-2">
              {CALENDAR_KINDS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setKind(option)}
                  aria-pressed={kind === option}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors duration-[var(--motion-fast)] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                    kind === option
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(`kind.${option}`)}
                </button>
              ))}
            </div>
          </fieldset>

          {entry ? null : (
            <div className="space-y-2">
              <Label htmlFor="calendar-event">{t("dialog.eventLabel")}</Label>
              <Select
                items={[
                  { value: "", label: t("dialog.eventNone") },
                  ...eventOptions.map((option) => ({
                    value: option.id,
                    label: option.title,
                  })),
                ]}
                value={eventId}
                onValueChange={(value) => setEventId(value ?? "")}
              >
                <SelectTrigger id="calendar-event" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("dialog.eventNone")}</SelectItem>
                  {eventOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="calendar-allday">{t("dialog.allDayLabel")}</Label>
            <Switch
              id="calendar-allday"
              checked={allDay}
              onCheckedChange={setAllDay}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="calendar-start">{t("dialog.startLabel")}</Label>
              <Input
                id="calendar-start"
                type={allDay ? "date" : "datetime-local"}
                value={allDay ? start.slice(0, 10) : start}
                onChange={(event) =>
                  setStart(mergeDatePart(start, event.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calendar-end">{t("dialog.endLabel")}</Label>
              <Input
                id="calendar-end"
                type={allDay ? "date" : "datetime-local"}
                value={allDay ? end.slice(0, 10) : end}
                onChange={(event) =>
                  setEnd(mergeDatePart(end, event.target.value))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="calendar-location">
              {t("dialog.locationLabel")}
            </Label>
            <Input
              id="calendar-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={140}
            />
          </div>

          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {t(`errors.${error}`)}
            </p>
          ) : null}
        </div>

        <DialogFooter className="gap-2">
          {entry ? (
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

/**
 * Keeps the stored value at full `YYYY-MM-DDTHH:mm` width even while an all-day
 * (date-only) input is driving it.
 *
 * Without this, editing the date with All day on would leave a bare
 * `YYYY-MM-DD` in state; toggling All day back off then hands that to a
 * `datetime-local` input, which the browser rejects outright — the field blanks
 * and the organizer sees their date vanish, even though the value is still
 * there and would save correctly.
 */
function mergeDatePart(previous: string, next: string): string {
  if (!next) return "";
  if (next.length > 10) return next;
  const time = previous.length > 10 ? previous.slice(11, 16) : "00:00";
  return `${next}T${time}`;
}

/** `datetime-local` wants `YYYY-MM-DDTHH:mm` in the viewer's own timezone. */
function toLocalInput(millis: number | null): string {
  if (millis === null) return "";
  const offset = new Date(millis).getTimezoneOffset() * 60_000;
  return new Date(millis - offset).toISOString().slice(0, 16);
}

/** Accepts both widths the input can produce, date-only and date-with-time. */
function fromLocalInput(value: string): number | null {
  if (!value) return null;
  const millis = new Date(
    value.length === 10 ? `${value}T00:00:00` : value,
  ).getTime();
  return Number.isFinite(millis) ? millis : null;
}
