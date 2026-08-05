/**
 * Read-only inspection of the seeded test data.
 * node functions/scripts/inspect-test-data.mjs --project=<id>
 */
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.argv
  .slice(2)
  .find((a) => a.startsWith("--project="))
  ?.split("=")[1];
if (!projectId) {
  console.error("Missing --project=");
  process.exit(1);
}

initializeApp({ credential: applicationDefault(), projectId });
const db = getFirestore();

const users = await db.collection("users").limit(5).get();
console.log("USERS");
for (const d of users.docs) {
  console.log(`  ${d.id}  role=${d.get("role")}  ${d.get("email") ?? "?"}`);
}

const events = await db.collection("events").limit(5).get();
console.log("\nEVENTS");
for (const d of events.docs) {
  console.log(
    `  ${d.id}  "${d.get("title")}"  status=${d.get("status")}  cover=${d.get("coverImage") ? "yes" : "NONE"}  org=${d.get("organizationId")}`,
  );
}

const tickets = await db.collection("tickets").limit(5).get();
console.log(`\nTICKETS: ${tickets.size}`);
for (const d of tickets.docs) {
  console.log(`  ${d.id}  owner=${d.get("ownerId")}  status=${d.get("status")}`);
}

const bookings = await db.collection("bookings").limit(5).get();
console.log(`\nBOOKINGS: ${bookings.size}`);
for (const d of bookings.docs) {
  console.log(`  ${d.id}  status=${d.get("status")}  attendee=${d.get("attendeeId")}`);
}
