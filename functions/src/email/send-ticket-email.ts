import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions";

/**
 * Resend HTTP API, not SMTP (canonical §13 rejects SMTP).
 *
 * Delivery is optional on purpose: ticket issuance must not fail because email
 * is unconfigured. Without a usable key the QR, the wallet and check-in all
 * still work and the ticket records `emailSentAt: null`.
 *
 * Cloud Functions requires every declared secret to exist before deploy, so
 * until a real key is obtained set the placeholder and delivery stays off:
 *   printf 'disabled' | firebase functions:secrets:set RESEND_API_KEY
 * Replacing it with the real `re_…` key turns delivery on with no code change.
 */
export const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

/** Resend issues keys prefixed `re_`; anything else means delivery is off. */
function isUsableKey(key: string): boolean {
  return key.startsWith("re_");
}

const FROM = "EvenTech <tickets@evntech.com>";

export type TicketEmailInput = {
  to: string;
  attendeeName: string | null;
  eventTitle: string;
  eventStartsAt: Date | null;
  venueName: string | null;
  organizationName: string;
  quantity: number;
  ticketTypeName: string;
  qrImageUrl: string;
};

/**
 * Best-effort: returns whether the mail was accepted. Callers treat `false` as
 * "not sent yet", never as a failure of the surrounding operation.
 */
export async function sendTicketEmail(
  input: TicketEmailInput,
): Promise<boolean> {
  const key = RESEND_API_KEY.value();
  if (!isUsableKey(key)) {
    logger.info("No Resend key configured — skipping ticket email", {
      eventTitle: input.eventTitle,
    });
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [input.to],
        subject: `Your ticket — ${input.eventTitle}`,
        html: renderTicketEmail(input),
      }),
    });

    if (!response.ok) {
      logger.error("Resend rejected the ticket email", {
        status: response.status,
        body: await response.text(),
      });
      return false;
    }
    return true;
  } catch (error) {
    logger.error("Ticket email failed to send", error);
    return false;
  }
}

/**
 * Inline styles and a table layout, because mail clients strip stylesheets and
 * ignore flexbox. Dark surfaces mirror the product's dark-first identity (§8)
 * without depending on the client's own dark mode.
 */
function renderTicketEmail(input: TicketEmailInput): string {
  const when = input.eventStartsAt
    ? input.eventStartsAt.toUTCString().replace(" GMT", " UTC")
    : "";
  const rows: Array<[string, string]> = [
    ["Event", input.eventTitle],
    ["Organizer", input.organizationName],
  ];
  if (when) rows.push(["When", when]);
  if (input.venueName) rows.push(["Where", input.venueName]);
  rows.push(["Admits", `${input.quantity} × ${input.ticketTypeName}`]);

  const rowsHtml = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 0;color:#A1A1AA;font-size:14px;">${escapeHtml(label)}</td>
          <td style="padding:10px 0;color:#F5F5F6;font-size:14px;text-align:right;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:32px 16px;background:#0A0A0B;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#16161A;border:1px solid #26262B;border-radius:24px;">
      <tr>
        <td style="padding:32px 32px 8px;">
          <p style="margin:0;color:#A1A1AA;font-size:13px;letter-spacing:.08em;text-transform:uppercase;">You are on the list</p>
          <h1 style="margin:8px 0 0;color:#F5F5F6;font-size:28px;font-weight:600;line-height:1.2;">${escapeHtml(input.eventTitle)}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 32px;text-align:center;">
          <img src="${escapeHtml(input.qrImageUrl)}" width="220" height="220" alt="Entry QR code" style="display:block;margin:0 auto;background:#FFFFFF;border-radius:16px;padding:12px;" />
          <p style="margin:16px 0 0;color:#A1A1AA;font-size:13px;">Show this at the door. One scan admits your whole party.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #26262B;">
            ${rowsHtml}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
