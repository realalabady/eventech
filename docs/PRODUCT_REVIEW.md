# EvenTech — Final Product Review

**Date:** 2026-08-05
**Scope:** Full engineering, UX, performance, security and production review (TASK_15)
**Reviewer stance:** Critical. Nothing assumed correct without evidence.

Every number below was measured during this review, not estimated. Where
something could not be verified, that is stated rather than scored.

---

## 1. Executive summary

| Dimension | Score | Basis |
|---|---|---|
| **Architecture** | 8.5 / 10 | Deny-by-default rules, all writes through Cloud Functions, clean feature-first layering |
| **Security** | 7.5 / 10 | Strong model, but a critical live data exposure existed until this review |
| **UI** | 8 / 10 | Coherent token system: motion, type, elevation, icons all normalized |
| **UX** | 7.5 / 10 | Complete state coverage (loading/empty/error); dashboard only just built |
| **Performance** | 8 / 10 | LCP 3.9s → 2.0s cold / 0.73s warm, CLS 0. ~2.2MB JS remains |
| **Accessibility** | 8.5 / 10 | 0 contrast failures both themes, 26/26 focus indicators, skip link, WCAG 2.2 AA |
| **Scalability** | 7 / 10 | Realtime listeners unbounded; no pagination on growing collections |
| **Maintainability** | 8 / 10 | 157 tests, strong comments, but 4 component tests and zero E2E |
| **Production readiness** | **6 / 10** | No error tracking, App Check unenforced, production never verified end-to-end |

**Overall: 7.7 / 10.**

A genuinely well-built product with an unusually disciplined backend security
model, held back from launch readiness by observability gaps and a complete
absence of end-to-end verification.

---

## 2. Findings

### Critical — resolved during this review

**C1. Every organizer's IBAN was publicly readable.**
`organizations` was `allow get, list: if true` while `updateOrganization` wrote
`payment: { bankName, iban, accountHolder }` onto that same document. Firestore
has no field-level read security, so anyone holding the public web API key —
which ships in every page — could read every organizer's bank details with no
account at all.

Fixed: moved to `organizationPayments/{orgId}` (signed-in read, never listable,
function-only write), migrated with a dry-run-first script, and verified — 3
organizations scanned, 2 migrated complete, **0 `payment` fields remaining** on
any world-readable document. Deployed.

### High — open

**H1. No error tracking.** A production exception is currently invisible.
`docs/LAUNCH_CHECKLIST.md` §4 records this as a deliberate deferral ("a decision
rather than a task"), which is defensible — but launching without it means the
first users are the monitoring.

**H2. App Check is wired but not enforced.** `enforceAppCheck` is gated on
`APPCHECK_ENFORCE`, and the reCAPTCHA site key is still commented out in
`apphosting.yaml`. Callables are therefore open to any client holding the public
config. Rate limiting and auth checks mitigate but do not replace it.

**H3. Zero end-to-end tests.** 157 tests, of which 153 are logic/schema and 4 are
component tests added during this review. No test exercises signup → create event
→ publish → book → approve → ticket. The riskiest paths in the product are
verified only by hand.

**H4. Production has never been verified end-to-end.** Every measurement in this
review came from local dev or a locally-served production build. Nobody has
confirmed the deployed app works — and a recent sequencing error (migration run
before frontend deploy) left the attendee payment page blank in production for a
period.

### Medium

**M1. ~2.2 MB of JavaScript on every public page**, including a 285 KB zod chunk
on routes with no forms. `next/dynamic` boundaries were added and did separate
zod from Firebase, but Turbopack emits one shared client entry so byte weight is
unchanged. Needs a bundler-level fix.

**M2. Unbounded realtime listeners.** `useEvents`, `useOrganizationBookings` and
`useOrganizationTasks` subscribe to entire org-scoped collections with no limit
or pagination. Fine at current volume (4 events, 1 booking); a organizer with
10k bookings will download all of them.

**M3. 235 untokenized text sizes.** `text-sm` ×203, `text-xs` ×32 still bypass the
type scale. Visually identical today, so this is drift rather than a defect — but
changing the small-text step would move headings and leave body text behind.

**M4. Duplicate artist references.** `roof-top` lists six performers that are
three artists twice. Surfaces in Event JSON-LD, so search engines will index the
duplication. A data-layer dedupe, not a rendering bug.

### Low

**L1.** `NEXT_PUBLIC_SITE_URL` absent from `apphosting.yaml`; SEO canonicals fall
back to a hardcoded host. Correct today, wrong on a custom domain.
**L2.** No Firestore offline persistence — writes queue, but cached reads do not
survive a reload.
**L3.** No session idle timeout.
**L4.** `.claude/worktrees/` had been silently doubling every lint and test run.

---

## 3. Strengths

1. **The Firestore rules are the best part of this codebase.** Deny-by-default
   catch-all, *every* collection `write: if false`, and comments that explain the
   threat model rather than the syntax — the reports collection documents
   anti-retaliation reasoning, `rateLimits` explains why a readable counter is
   itself a leak.
2. **Security-sensitive logic genuinely lives server-side.** No client writes
   status, price, inventory or role anywhere.
3. **Storage rules are equally careful** — owner-scoped paths, content-type and
   size validation, receipts and QR never world-readable.
4. **The design system is now coherent end to end.** Motion, type, elevation and
   icon tokens each have one source, and drift was measured to zero at review
   time.
5. **Comment quality is unusually high.** Non-obvious decisions carry their
   reasoning, which is why this review could move quickly.

---

## 4. Weaknesses

1. **Observability is the weakest axis.** Analytics and Performance landed during
   this review; error tracking did not. Two Cloud Function alert policies exist.
   That is thin for a product handling payments.
2. **Verification depth is uneven.** Pure logic is well covered; rendered
   behaviour barely. Several defects this review found — a checkbox with
   `transition-none`, radio with zero transitions, a 600ms animation over the
   stated ceiling — had shipped precisely because nothing tested rendered output.
3. **The product has never been exercised as a user.** No E2E, and the one manual
   attempt was blocked by tooling.
4. **Growth assumptions are untested.** Every list is unbounded.

---

## 5. Recommendations, ranked by ROI

| # | Action | Effort | Impact | Risk |
|---|---|---|---|---|
| 1 | **Verify production end to end by hand** — signup → event → publish → book → approve → ticket | 1h | Critical | None |
| 2 | **Enforce App Check** — add reCAPTCHA key, flip `APPCHECK_ENFORCE` | 2h | High | Medium — verify before enabling |
| 3 | **Wire Sentry** | 2h | High | Low |
| 4 | **E2E tests for the booking path** (Playwright) | 1d | High | Low |
| 5 | **Paginate booking/event/task listeners** | 4h | Medium | Low — but touches live data paths |
| 6 | Move bank details onto the booking document; drop payment read to members-only | 4h | Medium | Medium |
| 7 | Bundler-level zod split | 4h | Medium | Medium |
| 8 | Migrate 235 text sizes to the type scale | 3h | Low | Low |
| 9 | `NEXT_PUBLIC_SITE_URL` in `apphosting.yaml` | 5m | Low | None |

Items 1–3 are the launch blockers. 4–5 should follow within the first weeks.

---

## 6. Final verdict

### Would I launch this today?

**Not for general availability. Yes for a controlled beta.**

The reasoning:

**Against GA.** A payments product with no error tracking, App Check unenforced,
and no end-to-end verification is one where the first real user is the test
suite. The IBAN exposure found during this review is the argument in miniature —
it survived because nothing was checking, and it was found by reading rules
against data shape, not by any automated gate. There may be others.

**For a controlled beta.** The security model is genuinely strong. Data integrity
is enforced server-side throughout. The UI is coherent and accessible. With a
handful of known organizers, the blast radius of an unknown defect is small
enough to be recoverable, and real usage will surface more than more auditing
will.

**The three things that change the answer to an unqualified yes:** production
verified end to end, App Check enforced, error tracking live. All three are
under a day's work combined.

---

## 7. Release checklist

### Blocking
- [ ] Manually verify the full booking flow against production
- [ ] Confirm attendee payment page shows bank details post-migration
- [ ] Enforce App Check (site key + `APPCHECK_ENFORCE=true`)
- [ ] Wire error tracking
- [ ] Confirm App Hosting build matches the current commit

### Before first real money
- [ ] E2E coverage of booking → approval → ticket
- [ ] Budget alert on the Firebase project
- [ ] Verify Firestore backup/recovery by restoring once
- [ ] Load-test the unbounded listeners with a realistic booking volume

### Housekeeping
- [ ] `NEXT_PUBLIC_SITE_URL` in `apphosting.yaml`
- [ ] `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` in `.env.example`
- [ ] Dedupe `artistIds`
- [ ] Free disk on the build machine (262 GB used; Turbopack cache compaction was failing)

---

## 8. Review limitations

Stated plainly, because a review that hides its blind spots is worth less than
one that names them.

- **Production was never exercised.** All measurements are local.
- **No screen reader testing.** ARIA is structurally correct; announcement
  quality is unverified.
- **Browser support unverified** — Chromium only.
- **Arabic/RTL checked structurally**, not read by an Arabic speaker.
- **Load and concurrency untested.**
- **The preview pane produced repeated false readings** during this review
  (frozen CSS transitions, a phantom "tabs are broken" defect, zero-width
  viewport overflow). Findings that depended on it were re-derived by other
  means; anything that could not be is listed as unverified above.
