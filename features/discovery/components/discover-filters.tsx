"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState, type ReactNode } from "react";

import { EmptyState } from "@/components/feedback/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EVENT_CATEGORIES } from "@/features/event/types";

export type FilterableItem = {
  id: string;
  category: string | null;
  /** Pre-lowercased haystack: title, description, city. */
  searchText: string;
  /**
   * The card, already rendered on the server. React Nodes serialize across the
   * boundary, so the cards stay Server Components and only the filtering is
   * client-side.
   */
  node: ReactNode;
};

/**
 * Search and category filtering run in the browser over the already-fetched
 * page of events. At MVP volume that is instant and avoids a round trip per
 * keystroke; when the catalogue outgrows one page this moves to a query.
 */
export function DiscoverFilters({
  items,
  categoryLabels,
}: {
  items: FilterableItem[];
  /** Translated category names, resolved on the server. */
  categoryLabels: Record<string, string>;
}) {
  const t = useTranslations("discover");
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("");

  // `items` lets the trigger render the selected category's label instead of
  // its raw value, and keeps "All" as a real option rather than a placeholder.
  const categoryItems = useMemo(
    () => [
      { value: "", label: t("allCategories") },
      ...EVENT_CATEGORIES.map((value) => ({
        value,
        label: categoryLabels[value] ?? value,
      })),
    ],
    [t, categoryLabels],
  );

  const visible = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = !category || item.category === category;
      const matchesTerm = !needle || item.searchText.includes(needle);
      return matchesCategory && matchesTerm;
    });
  }, [items, term, category]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="grid flex-1 gap-2">
          <Label htmlFor="discover-search">{t("searchLabel")}</Label>
          <Input
            id="discover-search"
            type="search"
            value={term}
            placeholder={t("searchPlaceholder")}
            onChange={(event) => setTerm(event.target.value)}
          />
        </div>
        <div className="grid gap-2 sm:w-56">
          <Label htmlFor="discover-category">{t("categoryLabel")}</Label>
          <Select
            items={categoryItems}
            value={category}
            onValueChange={(value) => setCategory(value ?? "")}
          >
            <SelectTrigger id="discover-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {t("resultCount", { count: visible.length })}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          illustration="search"
          title={t("empty")}
          description={t("emptyHint")}
        />
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((item) => (
            <li key={item.id}>{item.node}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
