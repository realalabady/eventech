"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";

import type { StepProps } from "../event-wizard";
import { AuthField } from "@/features/auth/components/auth-field";
import {
  scheduleSchema,
  type ScheduleValues,
} from "../../validation/event-schemas";

export function ScheduleStep({ event, save, onDone }: StepProps) {
  const t = useTranslations("event");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      startDate: event.startDate ?? "",
      endDate: event.endDate ?? "",
    },
  });

  async function onSubmit(values: ScheduleValues) {
    if (await save(values)) {
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
        hint={t("schedule.hint")}
        error={
          errors.endDate ? t(`errors.${errors.endDate.message}`) : undefined
        }
        {...register("endDate")}
      />

      <Button type="submit" disabled={isSubmitting}>
        {t("wizard.next")}
      </Button>
    </form>
  );
}
