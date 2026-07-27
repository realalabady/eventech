"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState, type ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        <div className="grid gap-2">
          <Label htmlFor="discover-category">{t("allCategories")}</Label>
          <select
            id="discover-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-11 rounded-md border border-input bg-transparent px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">{t("allCategories")}</option>
            {EVENT_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {categoryLabels[value] ?? value}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {t("resultCount", { count: visible.length })}
      </p>

      {visible.length === 0 ? (
        <div className="space-y-2 rounded-xl border border-border bg-card px-6 py-12 text-center">
          <p className="font-medium">{t("empty")}</p>
          <p className="text-sm text-muted-foreground">{t("emptyHint")}</p>
        </div>
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
