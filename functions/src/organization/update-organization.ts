import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import type { CallableResponse } from "../lib/errors";
import { requireAuth, requireMemberRole } from "../lib/organization-guards";

type Payload = {
  organizationId?: string;
  profile?: { name?: string; description?: string; website?: string };
  branding?: { primary?: string; logoUrl?: string; coverUrl?: string };
  payment?: { bankName?: string; iban?: string; accountHolder?: string };
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const IBAN = /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/;

/**
 * Profile, branding and bank details. Owners and managers only.
 *
 * `slug`, `verified`, `ownerId` and the counters are deliberately not writable
 * here — slug changes break public URLs, and verification is admin-only
 * (canonical §7).
 */
export const updateOrganization = onCall<Payload, Promise<CallableResponse>>(
  async (request) => {
    const { uid } = requireAuth(request);
    const organizationId = request.data?.organizationId;
    if (!organizationId) {
      throw new HttpsError("invalid-argument", "organizationId required.", {
        code: "VALIDATION_ERROR",
      });
    }
    await requireMemberRole(organizationId, uid, ["owner", "manager"]);

    const update: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    const profile = request.data?.profile;
    if (profile) {
      const name = (profile.name ?? "").trim();
      if (name.length < 2 || name.length > 100) {
        throw new HttpsError("invalid-argument", "Invalid name.", {
          code: "VALIDATION_ERROR",
        });
      }
      update.name = name;
      update.description =
        (profile.description ?? "").trim().slice(0, 1000) || null;
      update.website = (profile.website ?? "").trim() || null;
    }

    const branding = request.data?.branding;
    if (branding) {
      if (branding.primary !== undefined) {
        if (!HEX.test(branding.primary)) {
          throw new HttpsError("invalid-argument", "Invalid colour.", {
            code: "VALIDATION_ERROR",
          });
        }
        update["branding.primary"] = branding.primary.toLowerCase();
      }

      // Image URLs must point at this organization's own Storage prefix, so a
      // caller cannot park an arbitrary external URL on the public profile.
      for (const key of ["logoUrl", "coverUrl"] as const) {
        const url = branding[key];
        if (url === undefined) continue;
        const expectedPrefix = encodeURIComponent(
          `organizations/${organizationId}/`,
        );
        if (
          !url.startsWith("https://firebasestorage.googleapis.com/") ||
          !url.includes(expectedPrefix)
        ) {
          throw new HttpsError("invalid-argument", "Invalid image URL.", {
            code: "VALIDATION_ERROR",
          });
        }
        update[`branding.${key}`] = url;
      }
    }

    let paymentUpdate: {
      bankName: string;
      iban: string;
      accountHolder: string;
    } | null = null;
    const payment = request.data?.payment;
    if (payment) {
      const iban = (payment.iban ?? "").replace(/\s+/g, "").toUpperCase();
      const bankName = (payment.bankName ?? "").trim();
      const accountHolder = (payment.accountHolder ?? "").trim();
      if (!IBAN.test(iban) || !bankName || !accountHolder) {
        throw new HttpsError("invalid-argument", "Invalid bank details.", {
          code: "VALIDATION_ERROR",
        });
      }
      paymentUpdate = { bankName, iban, accountHolder };
    }

    const db = getFirestore();
    await db.collection("organizations").doc(organizationId).update(update);

    // Bank details go to a separate, non-public document. `organizations` is
    // world-readable and Firestore cannot hide a single field, so keeping the
    // IBAN there exposed it to unauthenticated readers.
    if (paymentUpdate) {
      await db
        .collection("organizationPayments")
        .doc(organizationId)
        .set({ ...paymentUpdate, updatedAt: FieldValue.serverTimestamp() });
    }

    await db.collection("auditLogs").add({
      actorId: uid,
      action: "updateOrganization",
      resourceType: "organization",
      resourceId: organizationId,
      // Never log the IBAN itself, only that bank details changed.
      metadata: {
        fields: Object.keys(update).filter((k) => k !== "updatedAt"),
      },
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true, message: "Organization updated." };
  },
);
