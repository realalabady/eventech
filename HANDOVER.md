# EvenTech — Handover

Snapshot for a fresh session. Written 2026-07-28, after Phase 9 and Phase 10a.

**If you read only one thing: the next task is Phase 10b** — the performance
and accessibility audit. Scope is in "Phase 10" below. Everything before it is
built and deployed.

## Read these first, in order

1. **`guides/50_CANONICAL_DECISIONS.md`** — the single source of truth. The other 49 guides were generated in multiple passes and contradict each other (six event lifecycles, five role lists, three wizard step lists). Guide 50 resolves every one of those. It outranks every other guide and the README.
2. **`CLAUDE_TASKS.md`** — standing design brief. All UI work is **refinement, never replacement**. Brand, IA, navigation, page hierarchy and palette are frozen. State what/why/which-files before implementing; report improvements after.
3. **`AGENTS.md`** — the non-negotiable engineering rules.

## Where it stands

Phases 0–9 of the canonical 12-phase plan (guide 50 §2) are done and deployed. Phase 10 is part-done: 10a landed, **10b is the remaining work**.

**Git state matters here.** Nothing has been pushed and **`main` has none of this work** — it is stuck at Phase 6 and its copy of this file still says "Next: Phase 7". Everything through Phase 10a lives on `feature/phase-7-tickets-checkin`, which is what the main checkout at `E:\Desktop\web\react\sell\evntech` has checked out. **The branch name is badly misleading** — it long ago outgrew Phase 7 and now carries through 10a. Do not trust the branch name or `main`; trust this table.

**After pulling new commits, run `pnpm install`.** Phases 8b/8c added
`@fullcalendar/react`, `temporal-polyfill` and `recharts`. Without it the build
fails on missing modules, which looks like broken code and is not.

| Phase                        | State                                                                     |
| ---------------------------- | ------------------------------------------------------------------------- |
| 0 Foundation                 | Next.js 16 + TS strict + Tailwind v4 + pnpm, i18n from day one            |
| 1 Design system              | 21 shadcn components on canonical tokens, dark-first, motion primitives   |
| 2 Authentication             | Email + Google, onboarding callable, custom claims, guards                |
| 3 Organizer foundation       | Organizations, branding, team, in-app invites                             |
| 4 Event management           | 9-step wizard, venues, artists, ticket tiers, publish gates               |
| 5 Public pages               | `/events/[slug]`, `/discover` with search, organizer + artist pages       |
| 6 Booking                    | Request → bank details → receipt → organizer approval                     |
| 7 Tickets & check-in         | Signed QR on approval, ticket wallet, door scanner, Resend delivery (off) |
| 8a Production tools          | Timeline, Kanban, activity feed — deployed                                |
| 8b Calendar + comms          | Unified calendar (FullCalendar v7), channels + messages — deployed        |
| 8c Analytics                 | Aggregate-on-read dashboards, Recharts, `trackEventView` — deployed       |
| 9a Admin foundation          | Admin shell, user management, audit log — callables deployed              |
| 9b Verification + moderation | Verified badge, org suspension, event takedown — deployed                 |
| 9c Reports, flags, settings  | Report queue, feature flags, platform settings — deployed                 |
| 10a Motion + error states    | Reduced-motion gap and two swallowed listeners fixed                      |
| 10b Performance + a11y audit | **Not started — the remaining work**                                      |

Recent commits: `5e68528` phase 9b/9c · `3654e53` phase 10a · `0855ec5` 9a review fixes · `4472ae7` phase 9a · `2325fa6` + `5f3853b` + `4f79816` 8b/8c review fixes · `ee0908a` phase 8c · `ab77817` phase 8b.

**A fresh worktree needs `.env.local` copied in.** It is gitignored, so a new
worktree has no Firebase config and `pnpm build` fails during prerender with a
Zod error about `authDomain`/`projectId` being undefined — which reads like a
code fault and is not. Copy it from the main checkout at
`E:\Desktop\web\react\sell\evntech\.env.local`.

### Phase 7 verification

Deployed and verified end to end against the live project on 2026-07-27, driving the real callables with a minted ID token: issuance via the repair path, QR render, the Storage write (PNG fetched back, 200/`image/png`), `validateTicket` leaving status `active`, `checkInTicket` flipping to `used`, a second scan refused with `ALREADY_EXISTS`, and a forged token rejected with `INVALID_QR`.

**Untested:** email delivery (Resend is off) and the browser UI itself — the wallet, the QR reveal and the camera scanner have never been exercised by a real signed-in user. The callables underneath them have.

### Secrets (Secret Manager, both set 2026-07-27)

- `TICKET_QR_SECRET` — signs QR tokens. **Never rotate it**; every ticket in circulation was signed with it.
- `RESEND_API_KEY` — currently the placeholder `disabled`. Delivery only turns on for a key starting `re_`, so tickets issue normally without one and record `emailSentAt: null`. Swapping in a real key needs no code change — **but also change the `FROM` address in `functions/src/email/send-ticket-email.ts`**, which is currently `tickets@evntech.com`, a domain not verified in Resend. Unverified senders are rejected, and the failure looks identical to "no key configured".

Set secrets with `--data-file`, never the interactive prompt: on Windows the masked prompt silently captures nothing when you paste into it, and piping a value adds a trailing newline that corrupts the key.

### Phase 9 — all three slices done

Phase 9 was as large as Phase 8, so it ran in three slices the same way.

**9a: admin shell, user management, audit log.** Callables are
deployed. `RequireAdmin` gates `/admin`; `users` was already `allow list: if
isAdmin()` from Phase 2, so **no rules change was needed**. `auditLogs` stays
`allow read, write: if false` — canonical §7 makes it never client-readable, so
admins page it through the `listAuditLogs` callable. That is the one deliberate
break from the realtime-listener pattern in the app.

Verified live with a minted ID token: `listAuditLogs` returns real entries from
Phase 3, and `suspendUser` refuses a self-suspend with `VALIDATION_ERROR`.
**Not verified in a browser** — see gotcha #12 and the note below on claims.

Audit entries use `resourceType`/`resourceId` (canonical §5), **not** guide 43's
`targetType`/`targetId`. Guide 43 is outranked, and `createOrganization` has
been writing the canonical names since Phase 3 — a second naming in one
collection renders every older row with a blank target. That bug was written
and then caught by the live check; do not reintroduce it.

#### 9b and 9c — done, verified live

Every callable was exercised against the real project with a minted ID token:
`verifyOrganizer` flipping the badge, `submitReport` accepting one report and
refusing the duplicate with `ALREADY_EXISTS`, `setFeatureFlag` rejecting a
dotted key (it would address a nested field instead of creating a flag), and
`updateSystemSettings` rejecting an out-of-range limit.

**Verification is badge-only** (canonical §3): it never gates publishing or
selling. Suspension is the control that bites, and it is enforced inside
`publishEvent` — the flag would otherwise be decoration. That gate is verified
rather than assumed: with the organization suspended, publishing returns `403
PERMISSION_DENIED`; unsuspended, the same call returns `200`.

**A takedown is a status change, never a delete.** Discovery and the public
event pages all query `status == "published"`, so moving an event off it
removes it from the site while the record, its bookings and its issued tickets
survive for the people already holding them. Only an event carrying a
`publishedAt` may be restored, or a takedown would push a never-published draft
live on the way back.

Already-published events are deliberately left alone when an organization is
suspended: pulling them would strand attendees holding valid tickets, so taking
one down stays a separate per-event decision.

`reports` is admin-read only — a reporter cannot read the queue back, not even
their own submissions, because it exposes who reported whom. `featureFlags` and
`systemSettings` are world-readable by design (signed-out marketing pages gate
on flags), which is exactly why `updateSystemSettings` writes an allowlisted
set of keys rather than accepting an arbitrary patch.

**`submitReport` is the only non-admin callable here and it is unrated** —
rate limiting is Phase 11. One open report per person per target is all that
currently stops the queue being buried.

New audit actions must be added to `KNOWN_AUDIT_ACTIONS` in
`features/admin/types.ts` or they render as the generic "Recorded an action"
sentence. All six from 9b/9c are already there.

### Phase 10 — 10a done, 10b owed

10a was begun before Phase 9 finished, at the owner's instruction; 9b and 9c
were then completed straight afterwards, so the phase order is whole again and
nothing is outstanding behind it.

#### 10a — done

- `blur-text.tsx` had no `prefers-reduced-motion` guard while rendering the
  **homepage hero**: a 10px blur and a 50px per-word translate, exactly the
  large transition canonical §9 strips. It is vendored ReactBits, so the guard
  is additive — re-generating the file will drop it again.
- `use-members.ts` and `use-organization.ts` **swallowed listener errors
  entirely** — no log, no flag. A failed roster rendered as "no team members",
  indistinguishable from an empty team (gotcha #4, in the two oldest hooks that
  predate the rule). Both now log; `useMembers` exposes `failed` and the team
  page renders a distinct error.
- Audited and found clean: no hardcoded visible string props anywhere
  (`aria-label`/`placeholder`/`alt`/`title` — the known `jsx-no-literals` gap),
  icon-only buttons all labelled, and every other motion component already
  guarded. The Aurora hero backdrop correctly collapses to a static gradient.

#### 10b — the next task

Performance and accessibility. Audit first and fix only what the audit finds —
that is how 10a stayed small and honest. Concretely:

- **Keyboard only.** Traverse the 9-step wizard, every dialog (task, calendar,
  channel), the Kanban, and the scanner without a mouse. Dialogs must trap
  focus and restore it to the trigger on close.
- **Focus visibility.** `globals.css` sets `outline-ring/50` globally; confirm
  it actually survives on the custom chip buttons in `task-dialog.tsx` and
  `calendar-dialog.tsx`, which set their own borders.
- **Heading order.** Every page renders one `h1` from its server component;
  panels below add `h2`. Check nothing skips a level.
- **Contrast at AA.** The risk spots are `text-muted-foreground` on `--card`,
  and the `warning`/`success` badges, which use accent colours as text.
- **RTL.** Arabic is a first-class locale but has barely been looked at. The
  calendar has an explicit RTL path; most other screens rely on logical
  properties being used correctly.
- **Perf budget re-measured** (canonical §11): JS < 250KB initial, LCP < 2.5s,
  INP < 200ms, CLS < 0.1, Lighthouse 95+. Recharts and FullCalendar are already
  confined to their own lazy chunks — confirm nothing new leaked into the
  shared bundle.

One known violation to decide on rather than silently keep:
`hero-backdrop.tsx` passes literal hex values to the WebGL Aurora, which the
design rules otherwise forbid. WebGL cannot read CSS variables directly, so it
needs either a documented exception or a small `getComputedStyle` bridge.

### There is no admin account, by design

`assignUserRole` requires an existing admin, so the first one cannot be made
from the UI. Bootstrap it:

```bash
node functions/scripts/grant-admin.mjs someone@example.com
```

It lives in `functions/` because that is where `firebase-admin` is installed —
Node resolves from the script's own directory, so a top-level `scripts/` copy
cannot find it. **The claim does not reach the browser until the ID token
refreshes** (gotcha #2), so the account must sign out and back in; otherwise
`/admin` bounces them home and it looks like the guard is broken.

The seeded test account was promoted to admin several times to verify 9a, 9b
and 9c, and **has been reverted to `organizer` with its `organizationId` claim
intact** — it is exactly as documented below. If a check script ever dies
part-way, re-check its claims before trusting them: one crashed run left the
account as admin and the next script captured that as its "restore to" value.

## Decisions already locked — do not relitigate

From guide 50 §1, all owner-approved:

- **One organization per user.** `organizationIds[]` stays an array for forward compatibility but holds at most one. No org switcher.
- **Team invites are in-app, not email**, until Phase 7 wires Resend.
- **Bank details live in organization settings**, and publishing a _paid_ event is blocked server-side until an IBAN exists. Free events are exempt.
- **Multiple ticket tiers in MVP**; a price of `0` marks a tier free.
- **Full artist pages in MVP** (`artists` collection + public pages).
- **Dark-first theme.** Accent hex values were undefined in every guide; they are defined in guide 50 §8.
- **i18n with zero hardcoded UI strings.** `en` + `ar`, RTL. Enforced by `react/jsx-no-literals` and a locale key-parity test.
- **Build order is organizer-first** (guide 47 + README). Guide 15's attendee-first order is rejected.

## Infrastructure facts

Firebase project **`eventech-2f278`**.

- **Firestore: `me-central2` (Dammam).** Auto-created in `nam5` (US); moved while empty because the location is permanent. Attendee PII and organizer IBANs stay in Saudi Arabia.
- **Cloud Functions: `me-central1` (Doha).** Dammam hosts Firestore but _not_ Functions — it is a restricted-service region. Doha is the nearest Functions region.
- **The region is declared twice and must stay in sync:** `setGlobalOptions` in `functions/src/index.ts` and `FUNCTIONS_REGION` in `firebase/client.ts`. A mismatch makes every callable 404.
- **Storage is still `US-EAST1`** — the default bucket, now holding receipts and cover images. Unresolved; see open items.
- `.env.local` holds the Firebase web config (gitignored; those values are public by design — security comes from rules and functions).

## Gotchas that cost real time here

Read this section before debugging anything similar.

0. **The Functions runtime SA needs a role for every new Google service you touch.** It is `119928286158-compute@developer.gserviceaccount.com` and holds only what has been granted by hand. Phase 7 was the first time a _function_ wrote to Storage (Phase 6 uploaded receipts from the browser), so it needed `roles/storage.objectAdmin` on `gs://eventech-2f278.firebasestorage.app` — without it the deploy still goes green and every approval then 403s. Secret access is the exception: `firebase deploy` grants `secretmanager.secretAccessor` per-secret automatically.
1. **The Compute Engine default SA had zero IAM roles.** New GCP projects use it for Cloud Build _and_ as the Functions runtime identity. It needed `cloudbuild.builds.builder`, `datastore.user`, and `firebaseauth.admin`. Symptoms: builds fail with "missing permission on the build service account"; then functions deploy but every Firestore call returns `PERMISSION_DENIED`. IAM grants take ~2 minutes to propagate.
2. **Custom claims do not reach the client until the ID token refreshes.** Any function that changes membership must be followed by `getIdToken(true)` client-side, or route guards keep seeing the old role and bounce the user. See `refreshClaims()` in `features/organization/services/organization-service.ts`.
3. **Storage rules must not read Firestore here.** Cross-service rules need the Storage service agent to hold Firestore permission, which it does not, and every upload silently failed with `storage/unauthorized`. Ownership is now expressed through the **path** — each writable prefix is namespaced by the uploader's uid — and the Cloud Function that records the URL enforces the real authorization before persisting it. Do not reintroduce `firestore.get()` in `storage.rules`.
4. **Never swallow a Firestore listener error.** A missing composite index made a broken query render as "No events yet" — indistinguishable from an empty list. All listeners now log and expose a `failed` flag. New composite queries need an entry in `firestore.indexes.json`, and indexes take a few minutes to build after deploy.
5. **Firestore `Timestamp` cannot cross the Server→Client boundary.** Server Components hand instants over as epoch milliseconds. Likewise, **functions cannot be passed to Client Components** — pass pre-rendered React Nodes instead (see `DiscoverFilters`).
6. **Base UI `Button` rendering a `Link` needs `nativeButton={false}`**, or it strips button semantics.
7. **Port 3000 is often taken by an unrelated project.** `.claude/launch.json` has `autoPort: true`.
8. **No Firestore triggers in this project.** Firestore is in `me-central2` and Functions cannot run there, so an `onDocumentUpdated` trigger would depend on cross-region Eventarc delivery. Ticket issuance therefore runs inline at the end of `approveBooking`, and is made safe by being idempotent (the ticket id **is** the booking id) — approving an already-approved booking re-runs issuance and repairs a missing ticket instead of double-claiming inventory.
9. **`react-hooks` lint rules here are strict, and they fire late.** `Date.now()` during render, writing a ref during render, and `setState` directly inside an effect are all **hard errors**, not warnings — `pnpm typecheck` and `pnpm build` pass happily and only `pnpm lint` catches them, so run lint before believing a component is finished. The sanctioned fixes, all used in the codebase: clock reads go through `hooks/use-now.ts` (`useSyncExternalStore`); a ref that a long-lived callback reads gets written in an effect, not in render (`ticket-scanner.tsx`); and **resetting form state when a different record is selected uses a changing `key` to remount, never an effect** (`task-dialog.tsx` plus the `session` counter in `task-board-panel.tsx`).

10. **Firestore rules are NOT filters — this cost two bugs in one session.** A `list` query is rejected outright unless the query's own constraints prove that _every possible_ result satisfies the rule. It is not evaluated per returned document. Every org-scoped collection here grants access via `isActiveMember(resource.data.organizationId)`, so **any list query must filter on `organizationId`**, even when a narrower filter would return only readable documents. Querying `bookings`/`tickets` by `eventId` alone, and `messages` by `channelId` alone, both failed with `permission-denied` while looking like perfectly reasonable queries. The tell is that a `getDoc` on the same data succeeds while the `list` fails. Adding the redundant-looking equality is free: Firestore serves equality-only queries by merging single-field indexes.

11. **FullCalendar v7 is not v6 with a new number.** `@fullcalendar/react` is self-contained — the `@fullcalendar/daygrid`-style plugin packages are obsolete (their latest stable is still 6.x) and plugins now come from subpaths like `@fullcalendar/react/daygrid`. It needs `temporal-polyfill` as a peer dependency. Internal class names are **hashed**, so its own markup cannot be targeted by hand; restyling goes through the theme's CSS variables, which is why `calendar-theme.css` loads the classic theme's structure and skips its `palette.css` entirely. Top-level `buttonText` is gone (locale data supplies it). The event property is `className` (a string), **not** v6's `classNames` array — the old key still type-checks because `EventInput` has an index signature for extended props, so it is silently swallowed and everything renders unstyled.

12. **A headless Browser pane cannot verify anything measurement-driven.** The pane reports `document.visibilityState === "hidden"` when it is not displayed, which means `requestAnimationFrame` never fires and `ResizeObserver` never fires — not even the initial callback it is guaranteed to emit on `observe()`. Anything that sizes itself from layout stays invisible: FullCalendar keeps its events at `visibility: hidden` inside a zero-height row, and `AnimatedCounter` sits frozen at 0. Both look exactly like product bugs and are not. Verify DOM structure with `textContent` (which ignores visibility) rather than `innerText`, and ask for the pane to be opened before concluding anything visual is broken.

## Test account — keep it

Seeded in the live project, deliberately retained:

- `layla+1785096812362@evntech-test.com` / `correct horse battery 9`
- Owns organization **Neon Coast Productions** (`neon-coast-productions`), email marked verified
- Has a published event **`neon-coast-opening-night`** (SAR 250 tier, 100 capacity) and one approved booking of 2 (`EV-THJRX3`), so the event reads sold 2 / available 98
- That booking now carries an **active ticket** (`tickets/1GhO59X9lVaB4Dk4W9zy`) with a live QR, issued during Phase 7 verification. Leave it — it is the only real ticket in the project and the easiest thing to scan when testing check-in.

Because it already owns an org, `createOrganization` and `acceptInvitation` will correctly reject it with `ALREADY_EXISTS`. Register a fresh `layla+<timestamp>@evntech-test.com` when a clean account is needed. **Firestore is no longer empty — never assume it is safe to wipe.**

## Open items

- **Move Storage out of `US-EAST1`.** Receipts (financial documents) and cover images live there while Firestore is in Dammam. Fixable by adding a Gulf bucket and pointing the SDK at it — unlike Firestore this is not permanent, but it gets harder as files accumulate.
- **Marketing pages** (about, contact, privacy, terms) from guide 15's Phase 2 are not built.
- **Receipt and QR download URLs are bearer tokens.** Firebase tokenised URLs bypass rules, so anyone holding one can view the file. Each URL sits on a document only the owner and the relevant org members can read — that is the protection. The QR _token_ is separately HMAC-signed, so possessing the image URL is not the same as being able to forge a ticket.
- **Nothing releases a used ticket.** There is no un-check-in, and `cancelBooking` still refuses approved bookings, so a mistaken scan can only be fixed in the console. Worth a proper flow before real doors.
- **No scheduled expiry** for stale `pending_payment` bookings yet, though the status exists.
- **Most UI is still unverified in a real browser.** What _has_ been driven by a signed-in user: the calendar (entry created and read back), messaging (channel created, message sent and rendered), and analytics (metrics and both charts rendered). Everything else — the Phase 7 wallet, QR reveal and camera scanner, Phase 8a's timeline/Kanban/activity feed, and the whole Phase 9 admin console — is proven only at the callable and build level.
- **The calendar's visual paint is specifically unconfirmed.** Entries reach the DOM with the right classes, but FullCalendar keeps them `visibility: hidden` in a zero-height row whenever `ResizeObserver` does not fire — which is always true in a non-displayed Browser pane (gotcha #12). Open the pane and load `/en/workspace/calendar` to settle it; do not "fix" it before checking that.
- **Phase 9b left two gaps that are surface, not defects.** `suspendUser` accepts and stores a `reason` that the UI never captures or displays, and `assignUserRole` is exported from `admin-service.ts` but wired to nothing — guide 43 lists "Change role" as an admin action. It is safe to wire now that the claim-wiping bug is fixed.
- **`roles/iam.serviceAccountTokenCreator` was granted to `fakealabady@gmail.com`** on the runtime service account, so Phase 7 could be tested by minting ID tokens locally. It lets the holder impersonate that service account — revoke it unless you are actively running such tests:
  `gcloud iam service-accounts remove-iam-policy-binding 119928286158-compute@developer.gserviceaccount.com --member="user:fakealabady@gmail.com" --role="roles/iam.serviceAccountTokenCreator" --project eventech-2f278`

## Commands

```bash
pnpm dev          # dev server (auto-ports if 3000 is busy)
pnpm lint         # eslint, incl. the no-hardcoded-strings rule
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest run
pnpm build        # production build
```

Deploy: `firebase deploy --only functions,firestore:rules,firestore:indexes,storage --project eventech-2f278`.
Grant the first admin: `node functions/scripts/grant-admin.mjs <email>` (see above).
Functions typecheck separately: `pnpm --dir functions typecheck` (they are a pnpm workspace package).
`pnpm format` before committing — `format:check` is stricter than lint and will otherwise fail CI.

Run `pnpm lint && pnpm typecheck && pnpm test` before considering any work done. **Lint is the one that catches the React rule violations** — typecheck and build pass without it (gotcha #9).

## Testing callables without a browser

Phases 7, 9a, 9b and 9c were all verified this way: mint a real ID token with the Admin SDK and call the deployed functions over HTTPS. **Reuse this rather than assuming a green deploy means a working feature** — it caught a live schema split in 9a and an unenforced suspension gate in 9b, both of which had deployed cleanly.

1. `admin.initializeApp({ projectId, serviceAccountId: "119928286158-compute@developer.gserviceaccount.com" })` under ADC.
2. `createCustomToken(uid)` → exchange at `identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=<NEXT_PUBLIC_FIREBASE_API_KEY>` for an `idToken`.
3. `POST https://me-central1-eventech-2f278.cloudfunctions.net/<name>` with `Authorization: Bearer <idToken>` and body `{"data": {...}}`.

The resulting token carries the user's real claims and `email_verified`, so guards behave exactly as they do in the browser. **`createCustomToken` needs `roles/iam.serviceAccountTokenCreator`** on the runtime SA — basic Owner does not include `iam.serviceAccounts.signBlob`. Grant it for the test run and revoke after (see Open items). Restore any data the test mutates.
