/**
 * Seeds ONE test ticket so the ticket-wallet Tabs render, which is the only
 * place the sliding tabs indicator appears.
 *
 * Authorized by the repo owner for UI verification. Clones the shape of an
 * existing ticket rather than inventing fields, so the wallet renders exactly
 * as it would for a real booking.
 *
 * The document id is fixed (`ui-test-ticket`) so this is idempotent and so the
 * cleanup below removes exactly what it created and nothing else.
 *
 *   inspect : node functions/scripts/seed-ui-test-ticket.mjs --project=<id>
 *   create  : node functions/scripts/seed-ui-test-ticket.mjs --project=<id> --owner=<uid> --apply
 *   remove  : node functions/scripts/seed-ui-test-ticket.mjs --project=<id> --remove
 */
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const args = process.argv.slice(2);
const get = (k) => args.find((a) => a.startsWith(`--${k}=`))?.split("=")[1];
const projectId = get("project");
const owner = get("owner");
const apply = args.includes("--apply");
const remove = args.includes("--remove");

if (!projectId) {
  console.error("Missing --project=");
  process.exit(1);
}

initializeApp({ credential: applicationDefault(), projectId });
const db = getFirestore();
const DOC_ID = "ui-test-ticket";

if (remove) {
  await db.collection("tickets").doc(DOC_ID).delete();
  console.log(`removed tickets/${DOC_ID}`);
  process.exit(0);
}

// Copy the field shape from a real ticket so nothing is guessed.
const existing = await db.collection("tickets").limit(1).get();
if (existing.empty) {
  console.error("No existing ticket to copy the shape from.");
  process.exit(1);
}
const template = existing.docs[0].data();
console.log("template fields:", Object.keys(template).join(", "));

if (!owner) {
  console.log("\nPass --owner=<uid> --apply to create.");
  process.exit(0);
}

const doc = {
  ...template,
  ownerId: owner,
  status: "active",
  createdAt: Timestamp.now(),
};

if (!apply) {
  console.log(`\nwould create tickets/${DOC_ID} for owner ${owner}`);
  process.exit(0);
}

await db.collection("tickets").doc(DOC_ID).set(doc);
console.log(`created tickets/${DOC_ID} for owner ${owner}`);
console.log("remove with: --remove");
