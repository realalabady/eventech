"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { fromZonedTime } from "date-fns-tz";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthField } from "@/features/auth/components/auth-field";

import type { StepProps } from "../event-wizard";
import { browserTimezone, toLocalInputValue } from "../../types";
import {
  scheduleSchema,
  type ScheduleValues,
} from "../../validation/event-schemas";

/**
 * Gulf zones first, then the organizer's own if it is not already listed.
 * A full picker is unnecessary while the product is regional; the stored value
 * is a real IANA id either way, so widening the list later needs no migration.
 */
function timezoneOptions(): string[] {
  const zones = [
    "Asia/Riyadh",
    "Asia/Dubai",
    "Asia/Qatar",
    "Asia/Kuwait",
    "Asia/Bahrain",
    "Europe/London",
    "UTC",
  ];
  const own = browserTimezone();
  return zones.includes(own) ? zones : [own, ...zones];
}

export function ScheduleStep({ event, save, onDone }: StepProps) {
  const t = useTranslations("event");
  const zones = timezoneOptions();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      startDate: toLocalInputValue(event.startDate, event.timezone),
      endDate: toLocalInputValue(event.endDate, event.timezone),
      timezone: event.timezone ?? browserTimezone(),
    },
  });

  async function onSubmit(values: ScheduleValues) {
    // The inputs give wall-clock time with no offset. Anchor it to the chosen
    // zone here so the stored instant is unambiguous no matter where the
    // organizer happens to be sitting.
    const saved = await save({
      startDate: fromZonedTime(values.startDate, values.timezone).toISOString(),
      endDate: fromZonedTime(values.endDate, values.timezone).toISOString(),
      timezone: values.timezone,
    });
    if (saved) {
      onDone();
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-lg space-y-5"
      noValidate
    >
      <AuthField
        id="event-start"
        type="datetime-local"
        label={t("schedule.startLabel")}
        error={
          errors.startDate ? t(`errors.${errors.startDate.message}`) : undefined
        }
        {...register("startDate")}
      />
      <AuthField
        id="event-end"
        type="datetime-local"
        label={t("schedule.endLabel")}
        error={
          errors.endDate ? t(`errors.${errors.endDate.message}`) : undefined
        }
        {...register("endDate")}
      />

      <div className="grid gap-2">
        <Label htmlFor="event-timezone">{t("schedule.timezoneLabel")}</Label>
        <Controller
          control={control}
          name="timezone"
          render={({ field }) => (
            <Select
              value={field.value ?? null}
              onValueChange={(value) => field.onChange(value)}
              name={field.name}
            >
              <SelectTrigger id="event-timezone" onBlur={field.onBlur}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {zones.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <p className="text-sm text-muted-foreground">
          {t("schedule.timezoneHint")}
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {t("wizard.next")}
      </Button>
    </form>
  );
}
