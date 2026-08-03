# EvenTech — Handover

Snapshot for a fresh session. Written 2026-07-28, **substantially revised
2026-07-29** after a browser verification sweep, a defect sweep across phases
5–10b, and Phase 11 launch hardening.

**If you read only one thing: all 12 canonical phases now have their code
built and deployed.** What remains is not a phase — it is the operational tail
in **`docs/LAUNCH_CHECKLIST.md`** (backups, monitoring, App Check enforcement)
plus the known gaps listed there. Read that file before doing launch work.

## Read these first, in order

1. **`guides/50_CANONICAL_DECISIONS.md`** — the single source of truth. The other 49 guides were generated in multiple passes and contradict each other (six event lifecycles, five role lists, three wizard step lists). Guide 50 resolves every one of those. It outranks every other guide and the README.
2. **`CLAUDE_TASKS.md`** — standing design brief. All UI work is **refinement, never replacement**. Brand, IA, navigation, page hierarchy and palette are frozen. State what/why/which-files before implementing; report improvements after.
3. **`AGENTS.md`** — the non-negotiable engineering rules.
4. **`docs/LAUNCH_CHECKLIST.md`** — Phase 11 state, the infrastructure steps
   that still need a console, and every known gap that outlives it.

## Where it stands

All 12 phases of the canonical plan (guide 50 §2) are built and deployed, 0 through 11.

**A caution that this document earned the hard way.** Everything through Phase 9 was once described here as "done and deployed" while two Phase 8a screens were completely dead, ticket times were three hours wrong for every attendee, and the landing page had exactly one working link. None of it showed up, because every claim rested on callable-level and build-level proof. The first sweep with a real signed-in browser found six defects in an afternoon. **Callables passing is not the same as the product working.** Treat any "verified" here as scoped to whatever was actually exercised, and see §8 of `FINAL_PHASES.md` for what has and has not been driven in a browser.

**The frontend is deployed** (2026-07-29) on Firebase App Hosting, backend `evntech-web`. Redeploy with `firebase deploy --only apphosting`. Config is `apphosting.yaml` plus the `apphosting` block in `firebase.json`.

Two live URLs: **`https://eventech-2f278.web.app`** (Firebase Hosting rewriting to Cloud Run) and `https://evntech-web--eventech-2f278.europe-west4.hosted.app` (App Hosting directly). The `web.app` one needs `allUsers` → `roles/run.invoker` on the `evntech-web` Cloud Run service; **if it starts returning 403, that binding is the first thing to check** — App Hosting owns the service and may reconcile its IAM. Command and reasoning in `docs/LAUNCH_CHECKLIST.md` §7.

**It runs in `europe-west4`, and that is a compromise, not a preference.** App Hosting has no Middle East region. Firestore stays in Dammam, so data at rest is unchanged, but **SSR now happens in the Netherlands** — the in-country guarantee guide 50 made holds for storage, not processing. See `docs/LAUNCH_CHECKLIST.md` §7 before quoting that guarantee to anyone.

**`packageManager` is pinned to `pnpm@10.26.0` and must stay in step with local pnpm.** The App Hosting builder otherwise installs pnpm 11, whose build-script settings differ enough to fail the build — that cost three failed deploys.

**Git state.** `main` now carries everything through Phase 10a and is pushed to `origin` (`github.com/realalabady/eventech`). It got there by a clean fast-forward from `feature/phase-7-tickets-checkin`, which had accumulated all 14 commits from Phase 7 onward while `main` sat at Phase 6.

That split is worth remembering, because it hid four phases of finished work for a while: the commits were being made on the feature branch, but `git push` only sends the current branch, so pushing from `main` published nothing. **`feature/phase-7-tickets-checkin` is now fully merged and redundant** — its name never matched its contents anyway. Work on `main`, or cut a branch named for the phase you are actually starting.

**After pulling new commits, run `pnpm install`.** Phases 8b/8c added
`@fullcalendar/react`, `temporal-polyfill` and `recharts`. Without it the build
fails on missing modules, which looks like broken code and is not.

| Phase                        | State                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| 0 Foundation                 | Next.js 16 + TS strict + Tailwind v4 + pnpm, i18n from day one                         |
| 1 Design system              | 21 shadcn components on canonical tokens, dark-first, motion primitives                |
| 2 Authentication             | Email + Google, onboarding callable, custom claims, guards                             |
| 3 Organizer foundation       | Organizations, branding, team, in-app invites                                          |
| 4 Event management           | 9-step wizard, venues, artists, ticket tiers, publish gates                            |
| 5 Public pages               | `/events/[slug]`, `/discover` with search, organizer + artist pages                    |
| 6 Booking                    | Request → bank details → receipt → organizer approval                                  |
| 7 Tickets & check-in         | Signed QR on approval, ticket wallet, door scanner, Resend delivery (off)              |
| 8a Production tools          | Timeline, Kanban, activity feed — deployed                                             |
| 8b Calendar + comms          | Unified calendar (FullCalendar v7), channels + messages — deployed                     |
| 8c Analytics                 | Aggregate-on-read dashboards, Recharts, `trackEventView` — deployed                    |
| 9a Admin foundation          | Admin shell, user management, audit log — callables deployed                           |
| 9b Verification + moderation | Verified badge, org suspension, event takedown — deployed                              |
| 9c Reports, flags, settings  | Report queue, feature flags, platform settings — deployed                              |
| 10a Motion + error states    | Reduced-motion gap and two swallowed listeners fixed                                   |
| 10b Performance + a11y audit | Done — headings, labels, RTL, nav overflow, token bridge. Contrast measured, see below |
| 11 Launch hardening          | Code done and deployed: rate limiting, rules review, App Check (off by design)         |

Recent commits: `9124f70` the phase 5–10b defect sweep · `728ad8b` focus rings · `63c2bd4` admin routing · `e6fee97` homepage headings.

**Two measurements that came out of 10b, both worth knowing before touching design or bundling:**

- **Light-theme contrast fails AA** on the `warning` (2.86), `success` (3.35) and `destructive` (4.00) badges, and `muted-foreground` on `--surface` (4.40). Dark — the default — passes everywhere, `muted-foreground` on `--card` at 7.04. Fixing this means changing canonical §8 palette values, which `CLAUDE_TASKS.md` freezes, so it is an owner decision and not a bug to quietly fix.
- **Initial JS is 167 KB gzipped**, inside canonical §11's 250 KB budget. LCP/INP/CLS are still unmeasured — the Browser pane never composited frames, so any runtime metric taken there would have been fiction.

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

#### 10b — done 2026-07-29

Delivered: an `h1` on the wizard page (all nine steps had none), kanban headings
promoted to `h2` to close a level skip, the cover-image input given a label
association, FullCalendar's prev/next hints routed through `messages/` (its
defaults are English strings no locale overrides), dialog and sheet close
buttons moved to logical `end-*` so they flip in RTL, the workspace nav turned
into a scroll strip — it was forcing ~690px of horizontal overflow onto every
workspace page at 375px — and the `hero-backdrop` hex removed in favour of
reading `--primary`/`--brand`/`--info` off `:root`.

The original scope is kept below because it names the right things to re-check
after any significant UI change:

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

### Phase 11 — launch hardening, code done 2026-07-29

Canonical §194 said App Check, rate limiting and daily backups were "built
compatible from day 1, ENFORCED at Phase 11". That held up: `RATE_LIMITED` was
already sitting in `ERROR_CODES` waiting to be used.

- **Rate limiting** — `functions/src/lib/rate-limit.ts`, a Firestore-backed
  fixed-window limiter. Guide 22's numbers where a callable exists (`createBooking`
  5/min, `submitReceipt` 10/hr, `inviteMember` 20/hr), plus `submitReport` 5/hr
  and `trackEventView` 60/min-per-IP. Guide 22's Authentication, Search and
  Notifications limits have no callable behind them; that is recorded in the file
  so they do not look forgotten. State lives in `rateLimits`, denied to all
  clients, reclaimed by a **TTL policy on `expiresAt`** that is declared in
  `firestore.indexes.json` under `fieldOverrides` — without it that collection
  grows forever.
- **Security rules review** — full pass. Two fixes: `rateLimits` explicitly
  denied, and `suspendedReason` + `email` added to `protectedUserFieldsUnchanged`,
  because suspension disables an account but its ID token stays valid up to an
  hour, leaving a window to blank the reason the admin console shows.
- **App Check** — client in `firebase/app-check.ts`, inert without a site key so
  fresh clones, emulators and CI keep working. Server side is
  `enforceAppCheck: process.env.APPCHECK_ENFORCE === "true"` and is **off on
  purpose**. Turning it on before a token-sending client is deployed rejects
  every call and takes the product down. The safe order is `docs/LAUNCH_CHECKLIST.md` §3.

### Bootstrapping the first admin

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

**This section used to claim there was no admin account "by design". That is
false and has been since before the 2026-07-29 sweep:** `fakealabady@gmail.com`
was already Super Admin, and `fakealabady+1@gmail.com` was granted admin during
the sweep at the owner's instruction and left there. Confirm both are intended
before launch — it is a row in `docs/LAUNCH_CHECKLIST.md` §5.

A pre-existing inconsistency worth knowing: ahmed's Firestore `users/{uid}.role`
read `admin` while the token claim read `organizer`. The admin console lists
roles from the **document**, so an account can display as admin while the route
guard treats it as an organizer.

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

**`docs/LAUNCH_CHECKLIST.md` is now the live list.** What follows is the subset that predates it, corrected.

**Closed since this list was written:** marketing pages (about/contact/privacy/terms are built and reachable via `PublicFooter`); the `suspendUser` reason and `assignUserRole` wiring (both now on the admin users page); the calendar paint question (it paints — the old note was the gotcha #12 headless artifact, as was "AnimatedCounter frozen at 0"); and "most UI unverified in a browser", which a full sweep on 2026-07-29 largely settled — see `FINAL_PHASES.md` §8 for the surface-by-surface record.

**Still open, and one item nobody had noticed:**

- **Eight orphaned Cloud Functions in `europe-west1`.** `d61bac8` moved the backend to `me-central1`; Firebase does not move functions between regions, it creates new ones and leaves the originals running. `acceptInvitation`, `assignUserRole`, `completeOnboarding`, `createOrganization`, `inviteMember`, `removeMember`, `updateMemberRole` and `updateOrganization` are still live there, frozen at their 2026-07-26 code — so that `inviteMember` has no rate limiting and that `assignUserRole` still has the claim-clobbering bug fixed in `ab20f39`. Not an open door (the admin check predates the move), but they must go. Command and full reasoning in `docs/LAUNCH_CHECKLIST.md` §5.1. **Run `firebase functions:list` after any future region change.**
- **Move Storage out of `US-EAST1`.** Receipts (financial documents) and cover images live there while Firestore is in Dammam. Fixable by adding a Gulf bucket and pointing the SDK at it — unlike Firestore this is not permanent, but it gets harder as files accumulate.
- **Receipt and QR download URLs are bearer tokens.** Firebase tokenised URLs bypass rules, so anyone holding one can view the file. Each URL sits on a document only the owner and the relevant org members can read — that is the protection. The QR _token_ is separately HMAC-signed, so possessing the image URL is not the same as being able to forge a ticket.
- **Nothing releases a used ticket.** There is no un-check-in, and `cancelBooking` still refuses approved bookings, so a mistaken scan can only be fixed in the console. Worth a proper flow before real doors.
- **No scheduled expiry** for stale `pending_payment` bookings yet, though the status exists.
- **The rate limiter has never been exercised against the live deployment.** It is unit-tested and deployed, but no real booking has run through `enforceRateLimit` since. It fails closed, so the first person to find a mistake in the transaction would be an attendee. One booking on Layla's org settles it.
- **`pnpm lint` reports ~900 phantom errors** from `.next` build output inside `.claude/worktrees/`. `.next/**` in `globalIgnores` only anchors at the repo root, so eslint walks the worktree checkouts. Adding `.claude/**` fixes it; `eslint.config.mjs` is protected by a hook, so this needs the hook disabled briefly or the stale worktrees deleted. Until then, lint the source directly: `pnpm exec eslint app components features tests hooks firebase`.
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
