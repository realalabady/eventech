import type { Locale } from "./routing";

const RTL_LOCALES: ReadonlySet<string> = new Set(["ar"]);

export type Direction = "ltr" | "rtl";

export function getDirection(locale: Locale): Direction {
  return RTL_LOCALES.has(locale) ? "rtl" : "ltr";
}
