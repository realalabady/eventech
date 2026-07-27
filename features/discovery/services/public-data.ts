import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as limitTo,
  orderBy,
  query,
  where,
  type Timestamp,
} from "firebase/firestore";

import { getFirebaseFirestore } from "@/firebase/client";

/**
 * Read-only access to public data, used from Server Components.
 *
 * These run through the ordinary client SDK rather than firebase-admin on
 * purpose: everything here is already world-readable under the security rules
 * (published events, organizer/venue/artist profiles), so the app needs no
 * service-account credentials to render public pages.
 */

export type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  coverImage: string | null;
  organizationId: string;
  venueId: string | null;
  artistIds: string[];
  startDateMs: number | null;
  endDateMs: number | null;
  timezone: string | null;
  ticketTypes: Array<{
    id: string;
    name: string;
    price: number;
    currency: string;
    quantity: number;
    sold: number;
  }>;
  availableTickets: number;
  bookingOpen: boolean;
  brandingPrimary: string;
};

export type PublicOrganization = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  website: string | null;
  verified: boolean;
  logoUrl: string | null;
  coverUrl: string | null;
};

export type PublicVenue = {
  id: string;
  name: string;
  address: string;
  city: string;
};

export type PublicArtist = { id: string; name: string };

/**
 * Timestamps cannot cross the server/client boundary, so instants are handed
 * over as epoch milliseconds and formatted in the event's timezone on render.
 */
function toMillis(value: unknown): number | null {
  const timestamp = value as Timestamp | null | undefined;
  return timestamp?.toMillis ? timestamp.toMillis() : null;
}

function toPublicEvent(id: string, data: Record<string, unknown>): PublicEvent {
  return {
    id,
    slug: (data.slug as string) ?? "",
    title: (data.title as string) ?? "",
    description: (data.description as string) ?? null,
    category: (data.category as string) ?? null,
    coverImage: (data.coverImage as string) ?? null,
    organizationId: (data.organizationId as string) ?? "",
    venueId: (data.venueId as string) ?? null,
    artistIds: (data.artistIds as string[]) ?? [],
    startDateMs: toMillis(data.startDate),
    endDateMs: toMillis(data.endDate),
    timezone: (data.timezone as string) ?? null,
    ticketTypes: (data.ticketTypes as PublicEvent["ticketTypes"]) ?? [],
    availableTickets: (data.availableTickets as number) ?? 0,
    bookingOpen: Boolean(data.bookingOpen),
    brandingPrimary:
      ((data.branding as { primary?: string })?.primary as string) ?? "#3b82f6",
  };
}

export async function listPublishedEvents(max = 60): Promise<PublicEvent[]> {
  const snapshot = await getDocs(
    query(
      collection(getFirebaseFirestore(), "events"),
      where("status", "==", "published"),
      orderBy("startDate", "asc"),
      limitTo(max),
    ),
  );
  return snapshot.docs.map((d) => toPublicEvent(d.id, d.data()));
}

export async function getEventBySlug(
  slug: string,
): Promise<PublicEvent | null> {
  const snapshot = await getDocs(
    query(
      collection(getFirebaseFirestore(), "events"),
      where("slug", "==", slug),
      where("status", "==", "published"),
      limitTo(1),
    ),
  );
  const document = snapshot.docs[0];
  return document ? toPublicEvent(document.id, document.data()) : null;
}

export async function getOrganization(
  id: string,
): Promise<PublicOrganization | null> {
  const snapshot = await getDoc(
    doc(getFirebaseFirestore(), "organizations", id),
  );
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const branding = (data.branding ?? {}) as {
    logoUrl?: string;
    coverUrl?: string;
  };
  return {
    id: snapshot.id,
    slug: data.slug ?? "",
    name: data.name ?? "",
    description: data.description ?? null,
    website: data.website ?? null,
    verified: Boolean(data.verified),
    logoUrl: branding.logoUrl ?? null,
    coverUrl: branding.coverUrl ?? null,
  };
}

export async function getOrganizationBySlug(
  slug: string,
): Promise<PublicOrganization | null> {
  const snapshot = await getDocs(
    query(
      collection(getFirebaseFirestore(), "organizations"),
      where("slug", "==", slug),
      limitTo(1),
    ),
  );
  const document = snapshot.docs[0];
  return document ? getOrganization(document.id) : null;
}

export async function getVenue(id: string): Promise<PublicVenue | null> {
  const snapshot = await getDoc(doc(getFirebaseFirestore(), "venues", id));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: data.name ?? "",
    address: data.address ?? "",
    city: data.city ?? "",
  };
}

export async function getArtists(ids: string[]): Promise<PublicArtist[]> {
  if (ids.length === 0) return [];
  const snapshots = await Promise.all(
    ids
      .slice(0, 20)
      .map((id) => getDoc(doc(getFirebaseFirestore(), "artists", id))),
  );
  return snapshots
    .filter((s) => s.exists())
    .map((s) => ({ id: s.id, name: (s.data().name as string) ?? "" }));
}

export async function getArtist(id: string): Promise<PublicArtist | null> {
  const snapshot = await getDoc(doc(getFirebaseFirestore(), "artists", id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, name: (snapshot.data().name as string) ?? "" };
}

/** Published events featuring a given artist, for the artist page. */
export async function listEventsByArtist(
  artistId: string,
): Promise<PublicEvent[]> {
  const snapshot = await getDocs(
    query(
      collection(getFirebaseFirestore(), "events"),
      where("status", "==", "published"),
      where("artistIds", "array-contains", artistId),
      limitTo(30),
    ),
  );
  return snapshot.docs.map((d) => toPublicEvent(d.id, d.data()));
}

/** Published events by one organizer, for the organizer page. */
export async function listEventsByOrganization(
  organizationId: string,
): Promise<PublicEvent[]> {
  const snapshot = await getDocs(
    query(
      collection(getFirebaseFirestore(), "events"),
      where("status", "==", "published"),
      where("organizationId", "==", organizationId),
      limitTo(30),
    ),
  );
  return snapshot.docs.map((d) => toPublicEvent(d.id, d.data()));
}
