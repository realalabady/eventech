/**
 * Copies each event's timezone onto the tickets already issued for it.
 *
 * `eventTimezone` is written at issuance now, but every ticket created before
 * that field existed has none — and a ticket with no zone renders its door time
 * in UTC. For a Riyadh event that is three hours early, which is the difference
 * between arriving on time and arriving after the doors close.
 *
 *   gcloud auth application-default login
 *   node functions/scripts/backfill-ticket-timezone.mjs --dry-run
 *   node functions/scripts/backfill-ticket-timezone.mjs
 *
 * Idempotent: tickets that already carry a zone are skipped, so it is safe to
 * re-run. Lives beside grant-admin.mjs for the same reason — `firebase-admin`
 * is installed in this package.
 */
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID ?? "eventech-2f278";
const dryRun = process.argv.includes("--dry-run");

initializeApp({ projectId: PROJECT_ID });
const db = getFirestore();

const tickets = await db.collection("tickets").get();
console.log(`${tickets.size} ticket(s) in ${PROJECT_ID}.`);

// One read per event, not per ticket: a busy event has thousands of tickets.
const timezones = new Map();
async function timezoneFor(eventId) {
  if (!timezones.has(eventId)) {
    const event = (await db.collection("events").doc(eventId).get()).data();
    timezones.set(eventId, event?.timezone ?? null);
  }
  return timezones.get(eventId);
}

let updated = 0;
let skipped = 0;
let unresolved = 0;

for (const doc of tickets.docs) {
  const ticket = doc.data();
  if (ticket.eventTimezone) {
    skipped += 1;
    continue;
  }

  const timezone = ticket.eventId ? await timezoneFor(ticket.eventId) : null;
  if (!timezone) {
    // Leave the field absent rather than writing null: a later run should still
    // pick this up if the event gains a zone.
    console.warn(`  ${doc.id}: event ${ticket.eventId} has no timezone`);
    unresolved += 1;
    continue;
  }

  console.log(`  ${doc.id} -> ${timezone}`);
  if (!dryRun) {
    await doc.ref.update({ eventTimezone: timezone, updatedAt: new Date() });
  }
  updated += 1;
}

console.log(
  `${dryRun ? "Would update" : "Updated"} ${updated}, skipped ${skipped} ` +
    `(already set), ${unresolved} with no event timezone.`,
);
