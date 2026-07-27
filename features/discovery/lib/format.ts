import { ar, enGB } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";

/**
 * Public-side date formatting. Instants arrive from Server Components as epoch
 * milliseconds (Timestamps cannot be serialized across that boundary), and are
 * always rendered in the event's own timezone so a Jeddah event reads as its
 * local door time wherever the viewer is.
 *
 * Month and weekday names follow the viewer's locale — the timezone decides
 * *which* moment is shown, the locale decides how it is written.
 */
export function formatPublicDate(
  millis: number | null,
  timezone: string | null,
  locale = "en",
  pattern = "EEE d MMM yyyy, HH:mm",
): string | null {
  if (!millis) return null;
  return formatInTimeZone(new Date(millis), timezone || "UTC", pattern, {
    locale: locale === "ar" ? ar : enGB,
  });
}

/** Lowest non-zero price, or null when every tier is free. */
export function lowestPrice(
  ticketTypes: Array<{ price: number; currency: string }>,
): { price: number; currency: string } | null {
  const paid = ticketTypes.filter((type) => type.price > 0);
  if (paid.length === 0) return null;
  return paid.reduce((min, type) => (type.price < min.price ? type : min));
}

export function formatPrice(
  price: number,
  currency: string,
  locale: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
