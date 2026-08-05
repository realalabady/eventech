/**
 * Verifies the bank-details migration actually closed the exposure.
 *
 * Checks two things:
 *   1. no `organizations/{id}` document still carries a `payment` field
 *      (that collection is world-readable, so any leftover is still exposed)
 *   2. every organization that had details now has an
 *      `organizationPayments/{id}` document
 *
 * Read-only. Never prints an IBAN — reports presence, not value.
 *
 *   node functions/scripts/verify-payment-migration.mjs --project=<id>
 */

import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.argv
  .slice(2)
  .find((a) => a.startsWith("--project="))
  ?.split("=")[1];

if (!projectId) {
  console.error("Missing --project=<firebase-project-id>");
  process.exit(1);
}

initializeApp({ credential: applicationDefault(), projectId });
const db = getFirestore();

const orgs = await db.collection("organizations").get();
const payments = await db.collection("organizationPayments").get();
const paymentIds = new Set(payments.docs.map((d) => d.id));

const stillExposed = [];
const migrated = [];

for (const doc of orgs.docs) {
  const name = doc.get("name") ?? "?";
  if (doc.get("payment")) {
    stillExposed.push(`${doc.id} (${name})`);
  }
  if (paymentIds.has(doc.id)) {
    const d = payments.docs.find((p) => p.id === doc.id);
    const complete = Boolean(d?.get("iban") && d?.get("bankName"));
    migrated.push(`${doc.id} (${name}) fields=${complete ? "complete" : "INCOMPLETE"}`);
  }
}

console.log(`organizations scanned:        ${orgs.size}`);
console.log(`organizationPayments docs:    ${payments.size}`);
console.log(`\nmigrated:`);
for (const m of migrated) console.log(`  + ${m}`);

if (stillExposed.length > 0) {
  console.log(`\n!! STILL PUBLICLY EXPOSED (payment field on world-readable doc):`);
  for (const s of stillExposed) console.log(`  - ${s}`);
  process.exit(1);
}

console.log(`\nOK — no payment field remains on any organizations document.`);
