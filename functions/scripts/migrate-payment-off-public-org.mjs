/**
 * Moves organizer bank details off the world-readable `organizations` document.
 *
 * WHY
 * `organizations` is `allow get, list: if true` so public organizer pages work
 * without auth. Firestore has no field-level read security, so while `payment`
 * lived on that document every organizer's IBAN, bank name and account holder
 * were readable by anyone holding the public web API key — no account needed.
 *
 * WHAT IT DOES
 *   1. copies `payment` to `organizationPayments/{orgId}`
 *   2. deletes the `payment` field from `organizations/{orgId}`
 *
 * Idempotent: an organization already migrated (no `payment` field) is skipped,
 * so re-running is safe.
 *
 * ORDER MATTERS. Deploy the new rules and functions FIRST, then run this.
 * Running it before the client update ships would blank the bank details shown
 * on the attendee payment page until the new read path is live.
 *
 * USAGE
 *   # dry run — prints what would change, writes nothing
 *   node functions/scripts/migrate-payment-off-public-org.mjs --project=<id>
 *
 *   # apply
 *   node functions/scripts/migrate-payment-off-public-org.mjs --project=<id> --apply
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS, or `gcloud auth application-default
 * login`, for a principal with Firestore write access.
 */

import { initializeApp, applicationDefault } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const projectId = args.find((a) => a.startsWith("--project="))?.split("=")[1];

if (!projectId) {
  console.error("Missing --project=<firebase-project-id>");
  process.exit(1);
}

initializeApp({ credential: applicationDefault(), projectId });
const db = getFirestore();

const snapshot = await db.collection("organizations").get();

let migrated = 0;
let skipped = 0;

for (const doc of snapshot.docs) {
  const payment = doc.get("payment");

  // Already migrated, or never had bank details.
  if (!payment || typeof payment !== "object") {
    skipped += 1;
    continue;
  }

  const { bankName, iban, accountHolder } = payment;
  // IBANs are never printed. The point of this script is that they were
  // over-exposed; echoing them into a terminal and CI log repeats the mistake.
  console.log(
    `${apply ? "migrating" : "would migrate"} ${doc.id} (${doc.get("name") ?? "?"})`,
  );

  if (apply) {
    await db
      .collection("organizationPayments")
      .doc(doc.id)
      .set({
        bankName: bankName ?? "",
        iban: iban ?? "",
        accountHolder: accountHolder ?? "",
        updatedAt: FieldValue.serverTimestamp(),
      });

    await doc.ref.update({ payment: FieldValue.delete() });
  }

  migrated += 1;
}

console.log(
  `\n${apply ? "Migrated" : "Would migrate"}: ${migrated}   Skipped: ${skipped}`,
);
if (!apply && migrated > 0) {
  console.log("Re-run with --apply to write the changes.");
}
