# EvenTech — Handover

Snapshot for a fresh session. Written 2026-07-27, after Phase 7.

## Read these first, in order

1. **`guides/50_CANONICAL_DECISIONS.md`** — the single source of truth. The other 49 guides were generated in multiple passes and contradict each other (six event lifecycles, five role lists, three wizard step lists). Guide 50 resolves every one of those. It outranks every other guide and the README.
2. **`CLAUDE_TASKS.md`** — standing design brief. All UI work is **refinement, never replacement**. Brand, IA, navigation, page hierarchy and palette are frozen. State what/why/which-files before implementing; report improvements after.
3. **`AGENTS.md`** — the non-negotiable engineering rules.

## Where it stands

Phases 0–7 of the canonical 12-phase plan (guide 50 §2) are done and deployed to the live Firebase project. Phase 7 is deployed but **has not yet had a ticket run through it end to end** — see "Phase 7 verification still owed" below.

| Phase                  | State                                                                     |
| ---------------------- | ------------------------------------------------------------------------- |
| 0 Foundation           | Next.js 16 + TS strict + Tailwind v4 + pnpm, i18n from day one            |
| 1 Design system        | 21 shadcn components on canonical tokens, dark-first, motion primitives   |
| 2 Authentication       | Email + Google, onboarding callable, custom claims, guards                |
| 3 Organizer foundation | Organizations, branding, team, in-app invites                             |
| 4 Event management     | 9-step wizard, venues, artists, ticket tiers, publish gates               |
| 5 Public pages         | `/events/[slug]`, `/discover` with search, organizer + artist pages       |
| 6 Booking              | Request → bank details → receipt → organizer approval                     |
| 7 Tickets & check-in   | Signed QR on approval, ticket wallet, door scanner, Resend delivery (off) |

Recent commits: `4dd44ab` phase 6 · `a45d2ce` phase 5 · `5381a19` timestamps · `cd429f8` phase 4 · `5242156` Gulf deploy + claim fixes.

### Phase 7 verification

Deployed and verified end to end against the live project on 2026-07-27, driving the real callables with a minted ID token: issuance via the repair path, QR render, the Storage write (PNG fetched back, 200/`image/png`), `validateTicket` leaving status `active`, `checkInTicket` flipping to `used`, a second scan refused with `ALREADY_EXISTS`, and a forged token rejected with `INVALID_QR`.

**Untested:** email delivery (Resend is off) and the browser UI itself — the wallet, the QR reveal and the camera scanner have never been exercised by a real signed-in user. The callables underneath them have.

### Secrets (Secret Manager, both set 2026-07-27)

- `TICKET_QR_SECRET` — signs QR tokens. **Never rotate it**; every ticket in circulation was signed with it.
- `RESEND_API_KEY` — currently the placeholder `disabled`. Delivery only turns on for a key starting `re_`, so tickets issue normally without one and record `emailSentAt: null`. Swapping in a real key needs no code change — **but also change the `FROM` address in `functions/src/email/send-ticket-email.ts`**, which is currently `tickets@evntech.com`, a domain not verified in Resend. Unverified senders are rejected, and the failure looks identical to "no key configured".

Set secrets with `--data-file`, never the interactive prompt: on Windows the masked prompt silently captures nothing when you paste into it, and piping a value adds a trailing newline that corrupts the key.

### Phase 8 is sliced

Too large for one pass, so it runs in three:

- **8a — done, local only.** Timeline, Kanban, activity feed. `/workspace/timeline` and `/workspace/tasks`, plus `createTask` / `updateTask` / `deleteTask` / `setTimelineStage`. **Needs a deploy of `functions` and `firestore:indexes`** — the activity feed orders by `createdAt` and will show its failed state until `activityLogs(eventId, createdAt)` is built.
- **8b — not started.** Calendar, team communication. Needs `calendarEvents`, `channels`, `messages` collections + rules, and FullCalendar restyled.
- **8c — not started.** Analytics dashboards, Recharts lazy-loaded.

**Open design question for 8c:** canonical §6 specifies `updateDashboardMetrics` as **Firestore triggers**, which this project cannot use (gotcha #0 — Firestore is in `me-central2`, Functions cannot run there). Either aggregate on read, or roll counters up from the callables that already run on approval and check-in. **Verify Cloud Scheduler is available in `me-central1` before designing around `generateDailyAnalytics`.**

Two guide-41 conflicts were resolved in 8a and should not be relitigated: Kanban columns follow canonical §4 (_In Progress / Done_, not guide 41's _Doing / Completed_, which §4 explicitly overrides), and timeline stages keep the vocabulary `createEvent` actually seeds (_planning / venue / artists / production / marketing / published_) rather than guide 41's Idea→Execution list, because those documents already exist in the database.

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
9. **`react-hooks` lint rules here are strict.** `Date.now()` during render, writing a ref during render, and `setState` directly inside an effect are all hard errors. For clock reads use `hooks/use-now.ts`, which wraps the clock in `useSyncExternalStore` and returns `null` until mount (also avoiding a hydration mismatch).

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
Functions typecheck separately: `pnpm --dir functions typecheck` (they are a pnpm workspace package).

Run `pnpm lint && pnpm typecheck && pnpm test` before considering any work done.
