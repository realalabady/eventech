import { z } from "zod";

import { EVENT_CATEGORIES } from "../types";

/** Messages are i18n keys resolved under `event.errors.*`. */

export const basicsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: "titleTooShort" })
    .max(120, { message: "titleTooLong" }),
  category: z.enum(EVENT_CATEGORIES, { message: "categoryRequired" }),
  description: z
    .string()
    .trim()
    .max(5000, { message: "descriptionTooLong" })
    .optional(),
});

export const venueSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "venueNameRequired" })
    .max(120, { message: "venueNameTooLong" }),
  address: z
    .string()
    .trim()
    .min(3, { message: "venueAddressRequired" })
    .max(300, { message: "venueAddressTooLong" }),
  city: z
    .string()
    .trim()
    .min(2, { message: "venueCityRequired" })
    .max(80, { message: "venueCityTooLong" }),
});

export const scheduleSchema = z
  .object({
    startDate: z.string().min(1, { message: "startRequired" }),
    endDate: z.string().min(1, { message: "endRequired" }),
  })
  // Times come from datetime-local inputs, so compare as dates not strings.
  .refine((value) => new Date(value.endDate) > new Date(value.startDate), {
    message: "endBeforeStart",
    path: ["endDate"],
  });

export const artistSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "artistNameRequired" })
    .max(120, { message: "artistNameTooLong" }),
});

export const ticketTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "ticketNameRequired" })
    .max(60, { message: "ticketNameTooLong" }),
  // 0 is allowed and means a free tier — it is what exempts an event from the
  // bank-details requirement at publish time (guide 50 §8).
  price: z
    .number({ message: "priceRequired" })
    .min(0, { message: "priceNegative" })
    .max(1_000_000, { message: "priceTooHigh" }),
  currency: z
    .string()
    .trim()
    .length(3, { message: "currencyInvalid" })
    .transform((value) => value.toUpperCase()),
  quantity: z
    .number({ message: "quantityRequired" })
    .int({ message: "quantityNotInteger" })
    .min(1, { message: "quantityTooLow" })
    .max(1_000_000, { message: "quantityTooHigh" }),
});

export type BasicsValues = z.infer<typeof basicsSchema>;
export type VenueValues = z.infer<typeof venueSchema>;
export type ScheduleValues = z.infer<typeof scheduleSchema>;
export type ArtistValues = z.infer<typeof artistSchema>;
export type TicketTypeValues = z.infer<typeof ticketTypeSchema>;
