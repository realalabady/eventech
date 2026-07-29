# EvenTech — Final Phases Handover

Written 2026-07-29, after the first end-to-end **browser verification sweep** with a
real signed-in user. That sweep is why this document exists: it found six
defects that every previous "verified" claim had missed, because everything
before it was proven only at the callable and build level.

**Status: all six defects in §3 were fixed and deployed later the same day**,
along with the 10b remainder (§4) and Phase 11 (§5). This document is kept as
the record of what was wrong and why — the diagnoses below are unedited, and
each defect now carries a short "Fixed" note. For current state read
`HANDOVER.md`; for launch work read `docs/LAUNCH_CHECKLIST.md`.

Its original headline, worth keeping visible: _the app was not as finished as
`HANDOVER.md` said._ Two Phase 8a screens were dead, ticket times were three
hours wrong for attendees, and the audit log was unreadable — none of it
visible from callable-level or build-level proof.

---

## 1. Where things actually stand

Canonical plan is 12 phases, numbered 0–11 (guide 50 §2). Updated the same
evening, after the fixes landed.

| Phase                          | State when this was written                                   | State now                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 0–4                            | Done                                                          | Done                                                                                                                                    |
| 5 Marketing + attendee         | Two dead CTAs (§3.6); about/contact/privacy/terms never built | **Done.** `PublicHeader` on the landing page, hero CTA → `/register`, four pages on a shared `StaticPage`, reachable via `PublicFooter` |
| 6 Booking                      | Done                                                          | Done                                                                                                                                    |
| 7 Tickets & check-in           | Ticket times render in UTC (§3.1)                             | **Fixed.** `eventTimezone` denormalised at issuance and backfilled. Resend still off                                                    |
| 8 Production tools + analytics | Timeline and Activity feed dead (§3.2)                        | **Fixed.** Both queries scoped by `organizationId`; composite index deployed                                                            |
| 9 Super Admin                  | Two defects (§3.3, §3.4)                                      | **Fixed**, plus role assignment and the suspension reason wired                                                                         |
| 10 Polish                      | 10b part-done                                                 | **Done.** See §4                                                                                                                        |
| 11 Launch Hardening            | Not started                                                   | **Code done and deployed.** Operational tail in `docs/LAUNCH_CHECKLIST.md`                                                              |

Commits: `9124f70` the §3 + §4 sweep · `728ad8b` focus rings · `63c2bd4` admin
routing + `/admin` index · `e6fee97` homepage headings/contrast.

---

## 2. Read these first

1. **`guides/50_CANONICAL_DECISIONS.md`** — single source of truth, outranks every other guide and both READMEs.
2. **`CLAUDE_TASKS.md`** — standing design brief. UI work is **refinement, never replacement**.
3. **`AGENTS.md`** — non-negotiable engineering rules.
4. **`HANDOVER.md`** — infrastructure facts and gotchas 0–12. The three wrong claims flagged in §6 have since been corrected there.
5. **`docs/LAUNCH_CHECKLIST.md`** — everything launch-related, and it supersedes §5 below.

---

## 3. The six defects — all fixed 2026-07-29

Every one was found in a browser with a real signed-in user. All were confirmed
against source, not inferred. The diagnoses below are left unedited because the
reasoning is what makes them re-findable; each now ends with what was done.

| §   | Defect                                | Fix                                                                                                                                                                                                                               |
| --- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 | Ticket times three hours wrong        | `eventTimezone` on `TicketDoc`, written in `generate-ticket.ts`, threaded through both components, existing ticket backfilled by `functions/scripts/backfill-ticket-timezone.mjs`. Confirmed live: 21:00, matching the event page |
| 3.2 | Timeline + Activity dead              | `where("organizationId", …)` added to both hooks, threaded from `ProductionPanel`; index widened to `(organizationId, eventId, createdAt)` and deployed                                                                           |
| 3.3 | Audit log unreadable                  | All nine actions registered; wording already existed in both locales. A test now greps `functions/src` for every `writeAuditLog` action so the list cannot drift again                                                            |
| 3.4 | Restore offered on drafts             | `!= null`, and `AdminEvent.publishedAt` made optional — the type was claiming `Timestamp \| null` while the hook cast raw data                                                                                                    |
| 3.5 | Workspace nav mobile overflow         | Scroll strip with `shrink-0`. Measured: 823px of items inside 376px, document overflow 691px → 0                                                                                                                                  |
| 3.6 | Two dead controls on the landing page | Inline header replaced with `PublicHeader`, hero CTA → `/register`. Measured: 1 working link → 12                                                                                                                                 |

### 3.1 Ticket times are three hours wrong (worst — attendee-facing)

An attendee holding a ticket is told to arrive at **18:00** for a **21:00** event.

| Surface                       | Shows        |
| ----------------------------- | ------------ |
| Public event page             | 21:00 ✅     |
| Ticket wallet + ticket detail | **18:00** ❌ |

Same browser (`Asia/Riyadh`), same event. 21:00 Riyadh = 18:00 UTC.

Cause: `features/discovery/lib/format.ts:20` falls back to UTC —
`formatInTimeZone(new Date(millis), timezone || "UTC", …)` — and both ticket
components pass `null` for that argument:

- `features/ticket/components/ticket-wallet.tsx:109`
- `features/ticket/components/ticket-detail.tsx:41`

The event page is correct because it uses `formatEventDate(value, event.timezone, …)`
(`features/event/types.ts:87`), and the **event** doc carries a timezone.

**This is not a one-line fix.** `TicketDoc` (`features/ticket/types.ts:5-14`) has
no timezone field. The event's timezone must be denormalised onto the ticket at
issuance — inside `approveBooking`, where issuance runs inline (gotcha #8) —
then threaded through both components. Existing tickets need a backfill.

### 3.2 Timeline and Activity feed are completely dead

`/workspace/timeline` renders both error states:
_"We could not load the timeline"_ and _"We could not load activity."_

```
[error] timeline listener failed FirebaseError: [code=permission-denied]
[error] activity listener failed FirebaseError: [code=permission-denied]
```

This is **gotcha #10 recurring verbatim** — Firestore rules are not filters. Both
queries filter on `eventId` alone:

- `features/timeline/hooks/use-timeline.ts:34`
- `features/activity/hooks/use-activity.ts:43`

But the rules grant via `isActiveMember(resource.data.organizationId)`
(`firestore.rules:141-145` and `208-212`), so Firestore rejects the whole list.

**Fix:** add `where("organizationId", "==", organizationId)` to both. The
activity query also has `orderBy("createdAt","desc")`, so it needs a composite
index in `firestore.indexes.json` — and indexes take minutes to build after deploy.

The data is fine. Verified directly in Firestore: 6 timeline docs, 1 activity
log, all carrying the correct `organizationId`. Only the queries are wrong.

**Messaging got exactly this fix in `4711053`. Phase 8a never did.** I audited
every `onSnapshot` in the codebase — these two are the only ones affected.
`use-tasks`, `use-calendar`, `use-messaging`, `use-events`, `use-members`,
`use-bookings` all correctly scope by `organizationId`.

### 3.3 The audit log is 100% unreadable

Every row renders the generic fallback _"Recorded an action"_. There is no way
to tell what any administrator did.

`features/admin/types.ts:37` registers only three actions:

```ts
export const KNOWN_AUDIT_ACTIONS = [
  "assignUserRole",
  "suspendUser",
  "restoreUser",
] as const;
```

None of the Phase 9b/9c actions (`verifyOrganizer`, `setFeatureFlag`,
`updateSystemSettings`, event takedown/restore) are registered — and those are
the only actions that have ever actually been fired, so every real entry
degrades to the fallback.

**`tests/admin.test.ts:101-103` cements the gap**, asserting
`isKnownAuditAction("verifyOrganizer") === false` and describing it as _"an
action from a future phase"_. It is not a future phase; 9b ships it today. Fix
the list **and** that test together, and add wording to `messages/en.json` +
`messages/ar.json` under `admin.audit.action` (the parity test at
`tests/admin.test.ts:105` will enforce both locales).

### 3.4 "Restore" is offered on never-published drafts

`features/admin/moderation-types.ts:72`:

```ts
export function canRestore(event: AdminEvent): boolean {
  return event.publishedAt !== null; // strict !== lets `undefined` through
}
```

A never-published draft has `publishedAt` **absent** (`undefined`), not `null`,
so `undefined !== null` is `true` and the button renders. This is exactly the
scenario the comment at `event-moderation.tsx:127-128` warns against — a
takedown pushing a draft live on the way back.

**Fix:** `return event.publishedAt != null;` (loose, catches both).

Confirmed live: the admin events page offered "Restore" on a draft that had
never been published.

### 3.5 Workspace nav breaks every workspace page on mobile

`components/navigation/workspace-nav.tsx:44`:

```tsx
<nav className="flex gap-1 lg:flex-col">
```

Below `lg` this is a non-wrapping flex **row**. Ten items ≈ 1100px, so at a
375px viewport the document is 1067px wide — **691px of horizontal overflow on
every workspace page**. Public pages are clean (0 overflow), so this is nav-only.

**Fix:** `flex-wrap`, `overflow-x-auto`, or a mobile drawer.

### 3.6 Two dead controls on the landing page

`app/[locale]/page.tsx` — the most visible page in the product:

- **line 43** — header "Sign in": `<Button variant="ghost" size="sm">` with no `href`, no `onClick`
- **line 68** — hero CTA "Start planning": `<Button size="lg">{t("cta")}</Button>`, same

The landing page **duplicates the header inline** instead of using
`components/navigation/public-header.tsx`, which _is_ correctly wired with
`nativeButton={false} render={<Link href="/login" />}`. The app name is a
`<span>`, not a link. There is no link to `/discover` anywhere on the page.

Net result: **the entire landing page has exactly one working link, and it goes
to `/design`** (the internal design-system showcase). A visitor cannot reach the
product from the homepage.

The two "Live on EvenTech" cards are hardcoded strings from `messages/en.json`
(`FEATURED_EVENTS`, lines 15-23), not real events, and are not clickable.

**Simplest fix:** replace the inline header with `<PublicHeader />` and give the
hero CTA a destination.

---

## 4. Phase 10b — done

Everything below was delivered on 2026-07-29 except the two measurements noted.
Contrast **was** measured and **fails in the light theme** — `warning` 2.86,
`success` 3.35, `destructive` 4.00, `muted-foreground` on `--surface` 4.40;
dark, the default, passes everywhere. Fixing it means changing canonical §8
palette values, which `CLAUDE_TASKS.md` freezes, so it is an owner decision.
Initial JS came in at **167 KB gzipped**, inside the 250 KB budget; LCP/INP/CLS
remain unmeasured because the Browser pane never composited frames.

The original list, kept as the re-check list for future UI work:

### What was owed

Three commits already landed: `e6fee97` (homepage heading semantics + label
contrast), `728ad8b` (focus rings on hand-rolled buttons), `63c2bd4` (admin
routing). Verified still-good in the browser: landing page heading order is
clean, and the focus-ring fix is correctly present on the calendar-dialog chips
(`focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50`).

Still owed:

- **Headings.** All **nine wizard steps render zero headings — no `h1` at all**.
  This breaks the 10b brief's own invariant ("every page renders one `h1` from
  its server component"). Also `/workspace/tasks` skips a level: `h1: Tasks` →
  `h3: To Do`, no `h2`.
- **Labels.** The cover-image file input on wizard step 6 (Branding) has no
  accessible name. Two buttons on the calendar page have no accessible name.
- **Keyboard traversal.** Not done. Note the dialog focus question is still
  open: the calendar dialog _does_ move focus inside on open and sets
  `aria-labelledby`, but after close `document.activeElement` was `BODY`, not
  the trigger. My close was programmatic, so **re-check with real keyboard
  input before changing anything.**
- **RTL.** `dir="rtl"`, `lang="ar"` and zero horizontal overflow confirmed on
  public pages. Our own code (`app/`, `components/`, `features/`) uses logical
  properties correctly — zero physical-margin violations. Two real issues remain
  in vendored shadcn: `components/ui/dialog.tsx:68` and `components/ui/sheet.tsx:68`
  pin close buttons to `right-2`/`right-3`, so they do not flip to the start
  edge in Arabic.
- **Contrast at AA.** Not measured. Risk spots per the original brief:
  `text-muted-foreground` on `--card`, and the `warning`/`success` badges.
- **Perf budget.** Not measured (canonical §11: JS < 250KB initial, LCP < 2.5s,
  INP < 200ms, CLS < 0.1, Lighthouse 95+).
- **`hero-backdrop.tsx`** still passes literal hex to the WebGL Aurora. Decide:
  documented exception or a `getComputedStyle` bridge. Do not silently keep it.

---

## 5. Phase 11 — Launch Hardening (code done and deployed)

Rate limiting, the rules review and App Check compatibility all landed on
2026-07-29 and are deployed; App Check enforcement is deliberately off until a
token-sending client ships. **`docs/LAUNCH_CHECKLIST.md` supersedes this
section** — it carries current state, the remaining console steps, and the
orphaned-`europe-west1`-functions finding that turned up while verifying the
deploy. Original scope below.

### Original scope

From guide 50 §2 and §194:

- **Security rules review** — full pass over `firestore.rules` and `storage.rules`.
- **App Check enforcement** — built compatible from day 1, enforced now.
- **Rate limiting** — guide 22's numeric limits. **`submitReport` is the urgent
  one:** it is the only non-admin callable in the admin surface and is
  completely unrated. One open report per person per target is all that
  currently stops the queue being buried.
- **Daily Firestore backups.**
- **Monitoring.**
- **Deployment checklist** — guide 49.

Carry-over items that belong here (from `HANDOVER.md` open items, all still open):

- **Move Storage out of `US-EAST1`.** Receipts are financial documents and cover
  images sit beside them, while Firestore is in Dammam. Not permanent like
  Firestore's location, but harder as files accumulate.
- **Nothing releases a used ticket.** No un-check-in, and `cancelBooking`
  refuses approved bookings, so a mistaken scan is only fixable in the console.
  Needs a real flow before live doors.
- **No scheduled expiry** for stale `pending_payment` bookings.
- **Receipt and QR download URLs are bearer tokens.** Firebase tokenised URLs
  bypass rules. The QR _token_ is separately HMAC-signed, so holding the image
  URL is not the same as being able to forge a ticket.
- **Revoke `roles/iam.serviceAccountTokenCreator`** from `fakealabady@gmail.com`
  unless actively minting test tokens:
  ```
  gcloud iam service-accounts remove-iam-policy-binding 119928286158-compute@developer.gserviceaccount.com --member="user:fakealabady@gmail.com" --role="roles/iam.serviceAccountTokenCreator" --project eventech-2f278
  ```
- **Marketing pages** (about, contact, privacy, terms) — Phase 5 scope, never built.
- **`suspendUser` stores a `reason` the UI never captures or displays**, and
  `assignUserRole` is exported from `admin-service.ts` but wired to nothing.
  Confirmed live: the admin users page has no "Change role" control.

---

## 6. Corrections to `HANDOVER.md` — since applied

All three were corrected in `HANDOVER.md` on 2026-07-29. Kept here as the record.

1. **"All six from 9b/9c are already there"** (line 125, about
   `KNOWN_AUDIT_ACTIONS`) — **false.** Only three actions are registered, and
   none of them are the 9b/9c ones. See §3.3.
2. **"There is no admin account, by design"** — **stale.**
   `fakealabady@gmail.com` was already Super Admin before this sweep, and
   `fakealabady+1@gmail.com` has since been granted admin (§7).
3. **"The calendar's visual paint is specifically unconfirmed"** — **resolved,
   it paints correctly.** With the Browser pane actually displayed
   (`visibilityState: "visible"`), entries render at `visibility: visible`,
   `opacity: 1`, 16×85px, in an 18px row. The hidden/zero-height behaviour was
   purely the gotcha #12 headless artifact. **Close this open item.**

---

## 7. Account state — changed during the sweep

| Account                                   | uid                            | Claims                                                    | Note                                                             |
| ----------------------------------------- | ------------------------------ | --------------------------------------------------------- | ---------------------------------------------------------------- |
| `fakealabady+1@gmail.com` ("ahmed admin") | `JlzXwsNqVpNo9z8uLNg3sCQOaoy2` | `role: admin`, `organizationId: OTZkoPIc2ZeAT62x1tss`     | **Promoted to admin and left there**, at the owner's instruction |
| `layla+1785096812362@evntech-test.com`    | `KRIOnnMS8sOsvG7VYreG48DB49l1` | `role: organizer`, `organizationId: GqBwnLysMRLZU4s87qng` | **Password was reset** at the owner's request. Claims untouched. |
| `fakealabady@gmail.com`                   | —                              | Super Admin                                               | Pre-existing                                                     |

**A pre-existing inconsistency worth knowing:** ahmed's Firestore
`users/{uid}.role` said `admin` while the token claim said `organizer`. The
admin console lists roles from the **doc**, so a user can display as admin while
the route guard treats them as an organizer. Not introduced by this sweep.

**Layla's org is the useful one for testing** — Neon Coast Productions, a
published event, one approved booking, and the project's only real ticket
(`tickets/1GhO59X9lVaB4Dk4W9zy`, still `active`, never scanned). **Leave that
ticket alone** — nothing releases a used ticket (§5).

### Test data to clean up

All in ahmed's org (`OTZkoPIc2ZeAT62x1tss`), all safe to delete:

- `events/CRp0oI9WhZ9O3oI8u5L7` — "QA Sweep Test Event", **draft, never published**
- 6 timeline docs, 4 tasks, 1 activity log attached to it
- `calendarEvents/THCTUe8InlzxkDabS2qT` — "QA Paint Check Entry"
- one artist "QA Test Artist", one venue "QA Test Venue"

---

## 8. What is now browser-verified (and what still is not)

The sweep changed this picture substantially. `HANDOVER.md`'s "most UI is still
unverified in a real browser" is now largely out of date.

**Verified working with a real signed-in user:**

| Surface           | Evidence                                                                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket wallet     | Real ticket renders, Upcoming/Used/Past tabs                                                                                                                                                      |
| **QR reveal**     | `<img alt="Entry QR code">` 640×640, PNG fetched from Storage, "Valid", "Admits 2 × Standard"                                                                                                     |
| Analytics         | Views 1, Bookings 1, Conversion 100%, both Recharts charts (115 nodes)                                                                                                                            |
| `trackEventView`  | End to end — the "Views 1" was a real page visit                                                                                                                                                  |
| `AnimatedCounter` | Shows correct non-zero values. **Not broken** — the "frozen at 0" note was the gotcha #12 artifact. No fix needed.                                                                                |
| 9-step wizard     | Full run-through, every step saved; cross-field validation correct ("end time must be after the start"); empty submit shows three `role="alert"` errors; paid-tier gate message appears at step 8 |
| Kanban            | 4 tasks, 4 columns                                                                                                                                                                                |
| Calendar          | Grid, month nav, dialog, save, Month/Week/List views                                                                                                                                              |
| Admin console     | All 6 pages: users, organizations, events, reports, platform, audit                                                                                                                               |
| Public pages      | Discover + event page on live data; "98 left" matches seeded sold-2/available-98                                                                                                                  |
| Scanner           | Video element, camera start, manual entry, non-destructive "Look up only" mode                                                                                                                    |

**Still not verified:**

- **Camera scanning itself** — the scanner UI mounts, but no QR has been scanned
  through a camera. Use "Look up only" so a test does not consume the live ticket.
- **Resend email delivery** — still off. See `HANDOVER.md` §Secrets: a real key
  also needs the `FROM` address in `functions/src/email/send-ticket-email.ts`
  changed off `tickets@evntech.com`, which is not a verified domain.
- **"Publish event"** — deliberately never fired. The button is **enabled on a
  paid event with no bank details**, and whether the server gate holds is
  untested. Testing it means risking a test event going live on public
  `/discover`. Worth verifying deliberately, on a throwaway event.
- **Contrast, keyboard traversal, perf budget** — see §4.

---

## 9. Environment — two traps that cost time every fresh worktree

Both confirmed again during this sweep.

1. **A fresh worktree has no `.env.local`.** It is gitignored, so `pnpm build`
   fails during prerender with a Zod error about `authDomain`/`projectId` being
   undefined — which reads like a code fault and is not. Copy it:
   `E:\Desktop\web\react\sell\evntech\.env.local`
2. **Run `pnpm install`.** Phases 8b/8c added `@fullcalendar/react`,
   `temporal-polyfill` and `recharts`.

Port 3000 is usually taken by an unrelated project; `.claude/launch.json` has
`autoPort: true` and will pick another.

---

## 10. Verification notes for whoever runs the next sweep

Hard-won during this one — they will save you from filing false bugs.

- **The `computer` click tool has a vertical offset of roughly one row in this
  environment.** Clicking a link at y=291 landed on the link _below_ it. This
  produced two false "dead button" findings before it was caught. **Drive
  interactions with `javascript_tool`** — `element.click()` and
  `form.requestSubmit()` hit the intended element every time.
- **FullCalendar v7 hashes its class names** (gotcha #11). Selectors like
  `[class*=fc-event]` match **nothing** — real markup looks like
  `fc-classic-F1o fc-classic-DIS`. Querying by class produced a false "calendar
  renders nothing" finding. **Check by `textContent` instead**, then measure the
  element you find.
- **The Browser pane must actually be displayed.** When hidden,
  `visibilityState === "hidden"`, so `requestAnimationFrame` and
  `ResizeObserver` never fire — FullCalendar keeps events hidden in zero-height
  rows and `AnimatedCounter` sits at 0. Both look exactly like product bugs.
  Confirm `document.visibilityState === "visible"` before concluding anything
  visual is broken.
- **A signed-in session in your own Chrome does not carry into the Browser
  pane.** They are separate browsers with separate storage. Sign in _inside the
  pane_.
- **`form_input` does work with React Hook Form** — verified when the venue step
  saved. If a form will not advance, suspect the click, not the fill.
- **Silence in the console is meaningful now.** After the 10a fix, every
  listener logs on failure. An empty list with no console error is a genuine
  empty list, not a swallowed query.

---

## 11. Commands

```bash
pnpm dev          # dev server (auto-ports if 3000 is busy)
pnpm lint         # eslint, incl. the no-hardcoded-strings rule
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest run
pnpm build        # production build
pnpm format       # before committing — format:check is stricter than lint
```

Deploy: `firebase deploy --only functions,firestore:rules,firestore:indexes,storage --project eventech-2f278`
Grant an admin: `node functions/scripts/grant-admin.mjs <email>` — then the
account must sign out and back in (gotcha #2).
Functions typecheck separately: `pnpm --dir functions typecheck`

Run `pnpm lint && pnpm typecheck && pnpm test` before considering work done.
**Lint is the one that catches the React rule violations** — typecheck and build
pass without it (gotcha #9).

---

## 12. Suggested order for the next session — completed as written

1. **§3.2** — timeline + activity queries. Two lines plus an index; unblocks two dead screens.
2. **§3.4** — `canRestore`, one character.
3. **§3.3** — audit actions + the test that cements the gap.
4. **§3.6** — landing page CTAs; swap the inline header for `PublicHeader`.
5. **§3.5** — workspace nav mobile overflow.
6. **§3.1** — ticket timezone. Biggest change (schema + function + UI + backfill), so do it with room.
7. Finish **10b** (§4), then start **Phase 11** (§5).

Nothing in §3 requires a browser to fix. Re-verify in one browser pass at the
end, following §10.
