"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AuthError } from "@/features/auth/components/auth-error";

import type { StepProps } from "../event-wizard";
import { ticketTypeSchema } from "../../validation/event-schemas";

type Draft = {
  id: string;
  name: string;
  price: string;
  currency: string;
  quantity: string;
};

function toDraft(index: number): Draft {
  return {
    id: `new-${index}-${Date.now()}`,
    name: "",
    price: "0",
    currency: "SAR",
    quantity: "100",
  };
}

/**
 * Ticket tiers (owner decision: multiple types in MVP). A price of 0 marks a
 * free tier, which is what exempts the event from the bank-details gate at
 * publish time.
 */
export function TicketsStep({ event, save, onDone }: StepProps) {
  const t = useTranslations("event");
  const [error, setError] = useState<string | undefined>();
  const [rows, setRows] = useState<Draft[]>(() =>
    (event.ticketTypes ?? []).length > 0
      ? event.ticketTypes.map((type) => ({
          id: type.id,
          name: type.name,
          price: String(type.price),
          currency: type.currency,
          quantity: String(type.quantity),
        }))
      : [toDraft(0)],
  );

  function update(id: string, field: keyof Draft, value: string) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  }

  const capacity = rows.reduce(
    (sum, row) => sum + (Number(row.quantity) || 0),
    0,
  );
  const isFree = rows.every((row) => Number(row.price) === 0);

  async function onContinue() {
    setError(undefined);

    const parsed = rows.map((row) =>
      ticketTypeSchema.safeParse({
        name: row.name,
        price: Number(row.price),
        currency: row.currency,
        quantity: Number(row.quantity),
      }),
    );

    const failure = parsed.find((result) => !result.success);
    if (failure && !failure.success) {
      setError(failure.error.issues[0]?.message ?? "validationFailed");
      return;
    }

    const ticketTypes = parsed.map((result, index) => ({
      id: rows[index].id.startsWith("new-") ? "" : rows[index].id,
      ...result.data!,
    }));

    if (await save({ ticketTypes })) {
      onDone();
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-medium tracking-tight">
          {t("tickets.heading")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("tickets.hint")}</p>
      </div>

      <AuthError message={error ? t(`errors.${error}`) : undefined} />

      <ul className="space-y-4">
        {rows.map((row) => (
          <li
            key={row.id}
            className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:items-end"
          >
            <div className="grid gap-1.5">
              <Label htmlFor={`t-name-${row.id}`}>
                {t("tickets.nameLabel")}
              </Label>
              <Input
                id={`t-name-${row.id}`}
                value={row.name}
                placeholder={t("tickets.namePlaceholder")}
                onChange={(e) => update(row.id, "name", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`t-price-${row.id}`}>
                {t("tickets.priceLabel")}
              </Label>
              <Input
                id={`t-price-${row.id}`}
                type="number"
                min="0"
                value={row.price}
                onChange={(e) => update(row.id, "price", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`t-cur-${row.id}`}>
                {t("tickets.currencyLabel")}
              </Label>
              <Input
                id={`t-cur-${row.id}`}
                maxLength={3}
                value={row.currency}
                onChange={(e) => update(row.id, "currency", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`t-qty-${row.id}`}>
                {t("tickets.quantityLabel")}
              </Label>
              <Input
                id={`t-qty-${row.id}`}
                type="number"
                min="1"
                value={row.quantity}
                onChange={(e) => update(row.id, "quantity", e.target.value)}
              />
            </div>
            {rows.length > 1 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() =>
                  setRows((current) => current.filter((r) => r.id !== row.id))
                }
              >
                {t("tickets.remove")}
              </Button>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setRows((current) => [...current, toDraft(current.length)])
          }
        >
          {t("tickets.add")}
        </Button>
        <p className="text-sm text-muted-foreground">
          {t("tickets.capacity", { count: capacity })}
        </p>
        {isFree ? (
          <p className="text-sm text-success">{t("tickets.free")}</p>
        ) : null}
      </div>

      <Button type="button" onClick={onContinue}>
        {t("wizard.next")}
      </Button>
    </div>
  );
}
