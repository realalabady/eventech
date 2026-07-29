import { describe, expect, it } from "vitest";

import ar from "../messages/ar.json";
import en from "../messages/en.json";

/**
 * Guide 22 §Rate Limits is the source of truth for these numbers, and the
 * limiter is the only thing standing between a loop and the booking inventory.
 * If someone retunes a limit, that should be a deliberate edit here too.
 */
describe("rate limits", () => {
  it("matches guide 22's published numbers", async () => {
    const { RATE_LIMITS } = await import("../functions/src/lib/rate-limit");
    const MINUTE = 60_000;
    const HOUR = 60 * MINUTE;

    expect(RATE_LIMITS.createBooking).toEqual({ limit: 5, windowMs: MINUTE });
    expect(RATE_LIMITS.submitReceipt).toEqual({ limit: 10, windowMs: HOUR });
    expect(RATE_LIMITS.inviteMember).toEqual({ limit: 20, windowMs: HOUR });
  });

  it("meters signed-in callers per account and the rest per IP", async () => {
    const { rateLimitKey } = await import("../functions/src/lib/rate-limit");

    expect(rateLimitKey({ auth: { uid: "u1" } } as never)).toBe("uid_u1");
    // Unauthenticated: trackEventView is public, so the IP is the only handle.
    expect(rateLimitKey({ rawRequest: { ip: "203.0.113.7" } } as never)).toBe(
      "ip_203-0-113-7",
    );
    // Neither available — one shared bucket is still better than no limit.
    expect(rateLimitKey({} as never)).toBe("anonymous");
  });

  it("keeps every limit positive and bounded", async () => {
    const { RATE_LIMITS } = await import("../functions/src/lib/rate-limit");

    for (const [action, { limit, windowMs }] of Object.entries(RATE_LIMITS)) {
      expect(limit, `${action} limit`).toBeGreaterThan(0);
      expect(windowMs, `${action} window`).toBeGreaterThan(0);
    }
  });
});

/**
 * A limiter that fires without a translated message just shows the generic
 * "something went wrong", which reads as a bug rather than a limit.
 */
describe("rate limit wording", () => {
  for (const namespace of ["admin", "booking", "organization"] as const) {
    it(`${namespace} explains a rate limit in both locales`, () => {
      expect(en[namespace].errors).toHaveProperty("rateLimited");
      expect(ar[namespace].errors).toHaveProperty("rateLimited");
    });
  }
});
