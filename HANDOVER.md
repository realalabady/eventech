# EvenTech — Handover

Snapshot for a fresh session. Written 2026-07-27, after Phase 6.

## Read these first, in order

1. **`guides/50_CANONICAL_DECISIONS.md`** — the single source of truth. The other 49 guides were generated in multiple passes and contradict each other (six event lifecycles, five role lists, three wizard step lists). Guide 50 resolves every one of those. It outranks every other guide and the README.
2. **`CLAUDE_TASKS.md`** — standing design brief. All UI work is **refinement, never replacement**. Brand, IA, navigation, page hierarchy and palette are frozen. State what/why/which-files before implementing; report improvements after.
3. **`AGENTS.md`** — the non-negotiable engineering rules.

## Where it stands

Phases 0–6 of the canonical 12-phase plan (guide 50 §2) are done, deployed, and verified against the live Firebase project — not just built locally.

| Phase                  | State                                                                   |
| ---------------------- | ----------------------------------------------------------------------- |
| 0 Foundation           | Next.js 16 + TS strict + Tailwind v4 + pnpm, i18n from day one          |
| 1 Design system        | 21 shadcn components on canonical tokens, dark-first, motion primitives |
| 2 Authentication       | Email + Google, onboarding callable, custom claims, guards              |
| 3 Organizer foundation | Organizations, branding, team, in-app invites                           |
| 4 Event management     | 9-step wizard, venues, artists, ticket tiers, publish gates             |
| 5 Public pages         | `/events/[slug]`, `/discover` with search, organizer + artist pages     |
| 6 Booking              | Request → bank details → receipt → organizer approval                   |

Recent commits: `4dd44ab` phase 6 · `a45d2ce` phase 5 · `5381a19` timestamps · `cd429f8` phase 4 · `5242156` Gulf deploy + claim fixes.

**Next: Phase 7 — Tickets & Check-in.** QR generation on approval, Resend email delivery, ticket wallet, scanner + check-in. `approveBooking` deliberately leaves `ticketId: null` for this to hang off. Needs a `RESEND_API_KEY` in `.env.local` (not yet obtained).

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

1. **The Compute Engine default SA had zero IAM roles.** New GCP projects use it for Cloud Build _and_ as the Functions runtime identity. It needed `cloudbuild.builds.builder`, `datastore.user`, and `firebaseauth.admin`. Symptoms: builds fail with "missing permission on the build service account"; then functions deploy but every Firestore call returns `PERMISSION_DENIED`. IAM grants take ~2 minutes to propagate.
2. **Custom claims do not reach the client until the ID token refreshes.** Any function that changes membership must be followed by `getIdToken(true)` client-side, or route guards keep seeing the old role and bounce the user. See `refreshClaims()` in `features/organization/services/organization-service.ts`.
3. **Storage rules must not read Firestore here.** Cross-service rules need the Storage service agent to hold Firestore permission, which it does not, and every upload silently failed with `storage/unauthorized`. Ownership is now expressed through the **path** — each writable prefix is namespaced by the uploader's uid — and the Cloud Function that records the URL enforces the real authorization before persisting it. Do not reintroduce `firestore.get()` in `storage.rules`.
4. **Never swallow a Firestore listener error.** A missing composite index made a broken query render as "No events yet" — indistinguishable from an empty list. All listeners now log and expose a `failed` flag. New composite queries need an entry in `firestore.indexes.json`, and indexes take a few minutes to build after deploy.
5. **Firestore `Timestamp` cannot cross the Server→Client boundary.** Server Components hand instants over as epoch milliseconds. Likewise, **functions cannot be passed to Client Components** — pass pre-rendered React Nodes instead (see `DiscoverFilters`).
6. **Base UI `Button` rendering a `Link` needs `nativeButton={false}`**, or it strips button semantics.
7. **Port 3000 is often taken by an unrelated project.** `.claude/launch.json` has `autoPort: true`.

## Test account — keep it

Seeded in the live project, deliberately retained:

- `layla+1785096812362@evntech-test.com` / `correct horse battery 9`
- Owns organization **Neon Coast Productions** (`neon-coast-productions`), email marked verified
- Has a published event **`neon-coast-opening-night`** (SAR 250 tier, 100 capacity) and one approved booking of 2 (`EV-THJRX3`), so the event reads sold 2 / available 98

Because it already owns an org, `createOrganization` and `acceptInvitation` will correctly reject it with `ALREADY_EXISTS`. Register a fresh `layla+<timestamp>@evntech-test.com` when a clean account is needed. **Firestore is no longer empty — never assume it is safe to wipe.**

## Open items

- **Move Storage out of `US-EAST1`.** Receipts (financial documents) and cover images live there while Firestore is in Dammam. Fixable by adding a Gulf bucket and pointing the SDK at it — unlike Firestore this is not permanent, but it gets harder as files accumulate.
- **Marketing pages** (about, contact, privacy, terms) from guide 15's Phase 2 are not built.
- **Receipt download URLs are bearer tokens.** Firebase tokenised URLs bypass rules, so anyone holding one can view the receipt. The URL sits on the booking document, which only the attendee and org members can read — that is the protection.
- **No scheduled expiry** for stale `pending_payment` bookings yet, though the status exists.

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
