import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import type { CallableResponse } from "../lib/errors";
import { requireAuth, requireMemberRole } from "../lib/organization-guards";

const CATEGORIES = [
  "concert",
  "clubNight",
  "festival",
  "liveBand",
  "beachParty",
  "rooftopParty",
  "privateEvent",
];

type TicketTypeInput = {
  id?: string;
  name?: string;
  price?: number;
  currency?: string;
  quantity?: number;
};

type Payload = {
  eventId?: string;
  patch?: {
    title?: string;
    description?: string;
    category?: string;
    venueId?: string;
    artistIds?: string[];
    /** Absolute instants (ISO 8601 with offset), resolved on the client. */
    startDate?: string;
    endDate?: string;
    /** IANA zone the wall-clock times were entered in, e.g. Asia/Riyadh. */
    timezone?: string;
    ticketTypes?: TicketTypeInput[];
    coverImage?: string;
    branding?: { primary?: string };
  };
};

const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * Wizard autosave. Accepts a partial patch so each step can save independently.
 *
 * Inventory is authoritative here, never client-supplied: `capacity` and
 * `availableTickets` are recomputed from the ticket types, and each type's
 * `sold` count is preserved so an edit cannot wipe real sales.
 */
export const saveEventDraft = onCall<Payload, Promise<CallableResponse>>(
  async (request) => {
    const { uid } = requireAuth(request);
    const { eventId, patch } = request.data ?? {};
    if (!eventId || !patch) {
      throw new HttpsError("invalid-argument", "eventId and patch required.", {
        code: "VALIDATION_ERROR",
      });
    }

    const db = getFirestore();
    const eventRef = db.collection("events").doc(eventId);
    const snapshot = await eventRef.get();
    const event = snapshot.data();
    if (!snapshot.exists || !event) {
      throw new HttpsError("not-found", "Event not found.", {
        code: "NOT_FOUND",
      });
    }
    await requireMemberRole(event.organizationId, uid, ["owner", "manager"]);

    const update: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (patch.title !== undefined) {
      update.title = patch.title.trim().slice(0, 120) || null;
    }
    if (patch.description !== undefined) {
      update.description = patch.description.trim().slice(0, 5000) || null;
    }
    if (patch.category !== undefined) {
      if (!CATEGORIES.includes(patch.category)) {
        throw new HttpsError("invalid-argument", "Unknown category.", {
          code: "VALIDATION_ERROR",
        });
      }
      update.category = patch.category;
    }
    if (patch.venueId !== undefined) {
      update.venueId = patch.venueId || null;
    }
    if (patch.artistIds !== undefined) {
      update.artistIds = patch.artistIds.slice(0, 50);
    }
    // Dates are stored as Timestamps, not wall-clock strings, so reminder
    // scheduling and live-status transitions have an unambiguous instant to
    // work from. The IANA zone is kept alongside for local display.
    for (const key of ["startDate", "endDate"] as const) {
      const value = patch[key];
      if (value === undefined) continue;
      if (!value) {
        update[key] = null;
        continue;
      }
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        throw new HttpsError("invalid-argument", `Invalid ${key}.`, {
          code: "VALIDATION_ERROR",
        });
      }
      update[key] = Timestamp.fromDate(parsed);
    }

    if (patch.timezone !== undefined) {
      // Reject anything Intl cannot resolve rather than storing a bad zone.
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: patch.timezone });
      } catch {
        throw new HttpsError("invalid-argument", "Unknown timezone.", {
          code: "VALIDATION_ERROR",
        });
      }
      update.timezone = patch.timezone;
    }
    if (patch.coverImage !== undefined) {
      // Must point at this event's own Storage prefix, so a caller cannot park
      // an arbitrary external URL on a public page.
      if (patch.coverImage) {
        const expected = encodeURIComponent(`events/${eventId}/`);
        if (
          !patch.coverImage.startsWith(
            "https://firebasestorage.googleapis.com/",
          ) ||
          !patch.coverImage.includes(expected)
        ) {
          throw new HttpsError("invalid-argument", "Invalid cover URL.", {
            code: "VALIDATION_ERROR",
          });
        }
      }
      update.coverImage = patch.coverImage || null;
    }
    if (patch.branding?.primary !== undefined) {
      if (!HEX.test(patch.branding.primary)) {
        throw new HttpsError("invalid-argument", "Invalid colour.", {
          code: "VALIDATION_ERROR",
        });
      }
      update["branding.primary"] = patch.branding.primary.toLowerCase();
    }

    if (patch.ticketTypes !== undefined) {
      const existing: Record<string, number> = Object.fromEntries(
        (event.ticketTypes ?? []).map((type: { id: string; sold?: number }) => [
          type.id,
          type.sold ?? 0,
        ]),
      );

      const ticketTypes = patch.ticketTypes.slice(0, 20).map((type, index) => {
        const price = Number(type.price ?? 0);
        const quantity = Number(type.quantity ?? 0);
        if (!Number.isFinite(price) || price < 0) {
          throw new HttpsError("invalid-argument", "Invalid price.", {
            code: "VALIDATION_ERROR",
          });
        }
        if (!Number.isInteger(quantity) || quantity < 1) {
          throw new HttpsError("invalid-argument", "Invalid quantity.", {
            code: "VALIDATION_ERROR",
          });
        }
        const id = type.id || `${eventId}-t${index}-${Date.now()}`;
        const sold = existing[id] ?? 0;
        if (quantity < sold) {
          throw new HttpsError(
            "failed-precondition",
            "Quantity is below tickets already sold.",
            { code: "VALIDATION_ERROR" },
          );
        }
        return {
          id,
          name: (type.name ?? "").trim().slice(0, 60) || "Standard",
          price,
          currency: (type.currency ?? "SAR").trim().toUpperCase().slice(0, 3),
          quantity,
          sold,
        };
      });

      const capacity = ticketTypes.reduce((sum, t) => sum + t.quantity, 0);
      const soldTickets = ticketTypes.reduce((sum, t) => sum + t.sold, 0);
      update.ticketTypes = ticketTypes;
      update.capacity = capacity;
      update.soldTickets = soldTickets;
      update.availableTickets = capacity - soldTickets;
    }

    await eventRef.update(update);
    return { success: true, message: "Draft saved." };
  },
);
