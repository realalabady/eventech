"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AuthField } from "@/features/auth/components/auth-field";

import type { StepProps } from "../event-wizard";
import { EVENT_CATEGORIES } from "../../types";
import {
  basicsSchema,
  type BasicsValues,
} from "../../validation/event-schemas";

export function BasicsStep({ event, save, onDone }: StepProps) {
  const t = useTranslations("event");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BasicsValues>({
    resolver: zodResolver(basicsSchema),
    defaultValues: {
      title: event.title ?? "",
      category: event.category ?? undefined,
      description: event.description ?? "",
    },
  });

  async function onSubmit(values: BasicsValues) {
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
        id="event-title"
        label={t("basics.titleLabel")}
        placeholder={t("basics.titlePlaceholder")}
        error={errors.title ? t(`errors.${errors.title.message}`) : undefined}
        {...register("title")}
      />

      <div className="grid gap-2">
        <Label htmlFor="event-category">{t("basics.categoryLabel")}</Label>
        <select
          id="event-category"
          defaultValue=""
          className="h-11 rounded-md border border-input bg-transparent px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          {...register("category")}
        >
          <option value="" disabled>
            {t("basics.categoryPlaceholder")}
          </option>
          {EVENT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {t(`categories.${category}`)}
            </option>
          ))}
        </select>
        {errors.category ? (
          <p role="alert" className="text-sm text-destructive">
            {t(`errors.${errors.category.message}`)}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="event-description">
          {t("basics.descriptionLabel")}
        </Label>
        <Textarea
          id="event-description"
          rows={4}
          placeholder={t("basics.descriptionPlaceholder")}
          {...register("description")}
        />
        {errors.description ? (
          <p role="alert" className="text-sm text-destructive">
            {t(`errors.${errors.description.message}`)}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {t("wizard.next")}
      </Button>
    </form>
  );
}
