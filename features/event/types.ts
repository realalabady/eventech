import { formatInTimeZone } from "date-fns-tz";
import type { Timestamp } from "firebase/firestore";

import type { EventStatus } from "@/types/domain";

/** Canonical categories (guide 50 §10). */
export const EVENT_CATEGORIES = [
  "concert",
  "clubNight",
  "festival",
  "liveBand",
  "beachParty",
  "rooftopParty",
  "privateEvent",
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export type TicketType = {
  id: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  sold: number;
};

export type EventVenue = {
  id: string;
  name: string;
  address: string;
  city: string;
};

export type EventArtist = {
  id: string;
  name: string;
};

export type EventDoc = {
  id: string;
  organizationId: string;
  slug: string;
  title: string;
  description: string | null;
  category: EventCategory | null;
  status: EventStatus;
  coverImage: string | null;
  venueId: string | null;
  artistIds: string[];
  ticketTypes: TicketType[];
  capacity: number;
  soldTickets: number;
  availableTickets: number;
  /** Absolute instants. The wall-clock reading depends on `timezone`. */
  startDate: Timestamp | null;
  endDate: Timestamp | null;
  /** IANA zone the event happens in, e.g. "Asia/Riyadh". */
  timezone: string | null;
  bookingOpen: boolean;
  branding: { primary: string };
  createdBy: string;
};

/** Wizard steps, in order (guide 50 §10). */
export const WIZARD_STEPS = [
  "basics",
  "venue",
  "schedule",
  "artists",
  "tickets",
  "branding",
  "team",
  "payment",
  "review",
] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

/** The browser's zone, used as the default when creating an event. */
export function browserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

/**
 * Renders an instant in the event's own timezone, so a Jeddah event always
 * reads as its local door time regardless of who is looking at it.
 */
export function formatEventDate(
  value: Timestamp | null,
  timezone: string | null,
  pattern = "d MMM yyyy, HH:mm",
): string | null {
  if (!value) return null;
  return formatInTimeZone(
    value.toDate(),
    timezone || browserTimezone(),
    pattern,
  );
}

/** Value for a `datetime-local` input, expressed in the event's timezone. */
export function toLocalInputValue(
  value: Timestamp | null,
  timezone: string | null,
): string {
  if (!value) return "";
  return formatInTimeZone(
    value.toDate(),
    timezone || browserTimezone(),
    "yyyy-MM-dd'T'HH:mm",
  );
}

/** An event is free when every ticket type costs nothing. */
export function isFreeEvent(ticketTypes: TicketType[]): boolean {
  return ticketTypes.every((type) => type.price === 0);
}

export function totalCapacity(ticketTypes: TicketType[]): number {
  return ticketTypes.reduce((sum, type) => sum + type.quantity, 0);
}
