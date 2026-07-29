# Launch Checklist — Phase 11

Guide 49 as an actionable list, with the current state of each item. Written
2026-07-29 alongside the Phase 11 hardening work.

**Two items are load-bearing and not optional:** the `rateLimits` TTL policy
(§2.1) and the App Check enforcement _sequence_ (§3). Skipping the first grows a
collection forever; getting the second out of order takes the live app down.

**The single biggest gap is not on this list, it is upstream of it: the
frontend has never been deployed.** The backend is live and hardened — 40
callables, rules, indexes, rate limiting, monitoring — while the app itself
runs only on localhost. Several items here (App Check enforcement, Performance
Monitoring, the SEO and domain sections of guide 49) cannot start until that
changes, and the launch checklist is not really actionable end to end until it
does.

---

## 1. What Phase 11 shipped in code

| Item                  | State                                                                                                                                                                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rate limiting         | **Done and verified live 2026-07-29.** `functions/src/lib/rate-limit.ts`, applied to `createBooking`, `submitReceipt`, `inviteMember`, `submitReport`, `trackEventView`. Both paths exercised against the deployed functions — see §1.1. |
| App Check client      | **Done, inert.** `firebase/app-check.ts` — skipped entirely without a site key.                                                                                                                                                          |
| App Check enforcement | **Code-ready, off.** `enforceAppCheck: process.env.APPCHECK_ENFORCE === "true"` in `functions/src/index.ts`.                                                                                                                             |
| Security rules review | **Done.** `rateLimits` explicitly denied; `suspendedReason` and `email` added to `protectedUserFieldsUnchanged`.                                                                                                                         |
| Daily backups         | **Declined for now** by the owner, 2026-07-29 — see §2.2.                                                                                                                                                                                |
| Monitoring            | **Baseline done 2026-07-29.** Two Cloud Functions alert policies live, routed to email. Performance Monitoring, budget alert and error tracking still open — see §4.                                                                     |

Deploy the code side with:

```bash
firebase deploy --only functions,firestore:rules,firestore:indexes,storage --project eventech-2f278
```

### 1.1 Rate limiter — live verification, 2026-07-29

Unit tests pin the numbers to guide 22, but they do not prove the Firestore
transaction runs correctly against the real database. Both paths were driven
against the deployed functions:

**Happy path**, through `trackEventView` — the one callable that is
unauthenticated by design, so it can be driven without a password. Four calls,
all `200 {"success":true}`, event views 0 → 4, and two counter documents because
the calls straddled a minute boundary. The IPv6 caller key sanitized correctly
(`ip_2001-16a2-...`) and `expiresAt` landed at window start + 2 windows.

**Rejection path**, through `enforceRateLimit` directly with a synthetic caller
key, because proving this through `trackEventView` would have meant 61 real
calls and 61 fabricated views on a production event. `submitReport` has the
lowest ceiling at 5/hour:

```
call 1-5: allowed
call 6:   REJECTED — resource-exhausted / RATE_LIMITED / retryAfter=1222s
counter:  count=5   (stopped at the limit, no over-increment)
```

`details.code = RATE_LIMITED` is what the client maps to the `rateLimited`
message, so the user-facing wording is on the path that actually fires. Probe
counters were deleted afterwards rather than left to TTL.

**Side effect worth knowing:** event `4Ke4AXJgRyx9m8NI7QZQ` carries 4 views it
did not earn.

---

## 2. Firestore infrastructure

### 2.1 TTL policy on `rateLimits` — REQUIRED

The limiter writes one document per caller per window and never deletes them.
Firestore TTL is what reclaims them, keyed on the `expiresAt` field the limiter
already sets. Without this policy the collection grows without bound.

Declared in `firestore.indexes.json` under `fieldOverrides`, so `firebase deploy`
carries it and a fresh environment gets it without anyone remembering a manual
step. It was first enabled by hand with the command below, which is still the
way to turn it on for a database that has not had the file deployed yet:

```bash
gcloud firestore fields ttls update expiresAt --collection-group=rateLimits --enable-ttl --project=eventech-2f278
```

Confirm it is serving:

```bash
gcloud firestore fields ttls list --project=eventech-2f278
```

### 2.2 Daily backups — DECLINED for now

**The owner decided on 2026-07-29 not to set this up yet.** Recorded so the next
session does not read it as forgotten and quietly enable it. Canonical §194
lists daily backups as a Phase 11 enforcement item, so this is a deliberate
deviation to revisit before real money and real doors depend on the data.
The commands below are ready when that changes.

Guide 49 lists Firestore exports under "Backup Strategy". Canonical §194 makes
daily backups a Phase 11 enforcement item.

```bash
gcloud firestore backups schedules create --database="(default)" --recurrence=daily --retention=7d --project=eventech-2f278
```

Verify, and note the schedule id for the runbook:

```bash
gcloud firestore backups schedules list --database="(default)" --project=eventech-2f278
```

A backup you have never restored is a guess. Restore one into a scratch database
once before launch.

---

## 3. App Check — order matters

> **BLOCKED as of 2026-07-29: the frontend has never been deployed.**
> `https://eventech-2f278.web.app` returns "Site Not Found", `firebase.json` has
> no `hosting` block, and the 2026-07-26 "release" was the empty site being
> created. Step 2 below has no target and step 3 has no traffic to watch.
>
> Enforcing App Check now would attest a production client that does not exist
> while forcing every local dev session onto debug tokens — cost with no
> benefit. **Deploy the frontend first, then run this sequence.** The code side
> is already done and inert, so nothing is blocking that deploy.

Enforcement rejects every call arriving without a valid attestation token. Turn
it on before a token-sending client is live and **the whole product stops
working**. Do these in order, and do not compress steps 2 and 4.

1. **Register.** Firebase Console → App Check → Apps → register the web app with
   reCAPTCHA v3. Copy the site key.
2. **Ship the client.** Set `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` in the
   production environment and deploy the frontend. Nothing is enforced yet.
3. **Watch.** Console → App Check → Metrics. Wait until verified requests are
   the overwhelming majority and outdated clients have drained. Days, not
   minutes.
4. **Enforce the callables.** Put `APPCHECK_ENFORCE=true` in `functions/.env`,
   redeploy functions.
5. **Enforce the rest.** Turn on enforcement for Firestore and Storage in the
   console, one product at a time, watching metrics between each.

For a developer machine, register a debug token in the console and set
`NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN` locally. Never in a production
build — it bypasses attestation completely.

---

## 4. Monitoring

Before 2026-07-29 this project had **zero** alert policies and **zero**
notification channels. Two alerts now exist, created through the Monitoring
REST API (the `gcloud alpha monitoring` component is not installed and cannot
self-install non-interactively):

| Policy                         | Fires when                                          |
| ------------------------------ | --------------------------------------------------- |
| **Callables — 5xx error rate** | 5xx responses exceed ~1/min, sustained 5 minutes    |
| **Callables — p95 latency**    | p95 request latency exceeds 5s, sustained 5 minutes |

Both are enabled and route to the **EvenTech alerts** email channel
(`fakealabady@gmail.com`). Grouped by `service_name` so an alert names the
failing callable rather than the whole project.

**A trap worth recording:** Gen 2 Cloud Functions run on Cloud Run, so their
metrics live under `run.googleapis.com` against `resource.type =
"cloud_run_revision"`. Filtering on the `cloud_function` resource type — the
obvious guess — matches only Gen 1 and would build a policy that silently never
fires. That failure mode looks exactly like healthy service.

**Confirm the email channel actually delivers.** GCP created it enabled, but an
alert nobody receives is worse than no alert, because it reads as coverage.

Still open:

- **Firebase Performance Monitoring** — enable for the web app. Pointless until
  the frontend is deployed (§3).
- **Budget alert** on the project, which needs billing-account access.
  `trackEventView` is unauthenticated and now IP-limited, but Storage uploads
  under `events/{eventId}/cover/{uid}/` are writable by any signed-in user
  (see §6), so cost is the signal that catches abuse the rules cannot.
- **Error tracking**: guide 49 recommends Sentry. Not wired up — it adds a
  dependency and a DSN, so it is a decision rather than a task.

---

## 5. Security checklist (guide 49)

| Check                               | State                                                                                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Remove test accounts                | **Open.** See `FINAL_PHASES.md` §7 — QA event, tasks, calendar entry, artist and venue in ahmed's org are all disposable. Keep Layla's org and its one real ticket. |
| Rotate keys                         | **Open.** Do after removing test accounts.                                                                                                                          |
| Check permissions                   | **Done** this phase — full rules pass, two fixes.                                                                                                                   |
| Verify admin access                 | **Open.** `fakealabady@gmail.com` and `fakealabady+1@gmail.com` both hold admin. Confirm that is intended for launch.                                               |
| Enable App Check                    | **Sequenced above.**                                                                                                                                                |
| Revoke `serviceAccountTokenCreator` | **Open**, unless still minting test tokens:                                                                                                                         |

```bash
gcloud iam service-accounts remove-iam-policy-binding 119928286158-compute@developer.gserviceaccount.com --member="user:fakealabady@gmail.com" --role="roles/iam.serviceAccountTokenCreator" --project eventech-2f278
```

---

### 5.1 Orphaned functions in `europe-west1`

Found while verifying the Phase 11 deploy. `d61bac8` (2026-07-26) moved the
backend to `me-central1`; Firebase does not move functions between regions, it
creates new ones and leaves the originals running. Eight are still live in
`europe-west1`, frozen at their 2026-07-26 code:

`acceptInvitation`, `assignUserRole`, `completeOnboarding`, `createOrganization`,
`inviteMember`, `removeMember`, `updateMemberRole`, `updateOrganization`

They are not an open door — the admin check in `assignUserRole` predates the
move and is present in both copies — but they are stale in ways that matter:

- `inviteMember` there has **no rate limiting**; Phase 11 only reached the new region.
- `assignUserRole` there is the Phase 2 version, which **replaces custom claims
  instead of merging them** — it drops an organizer's `organizationId` and locks
  them out of their workspace. Fixed in `ab20f39`, never deployed to this region.
- App Check enforcement will not cover them, so they stay an unattested path.

Nothing in the client references them (`FUNCTIONS_REGION = "me-central1"`), so
they are reachable only by calling the URL directly with a valid ID token.
Delete them:

```bash
firebase functions:delete acceptInvitation assignUserRole completeOnboarding createOrganization inviteMember removeMember updateMemberRole updateOrganization --region europe-west1 --project eventech-2f278
```

Re-check after any future region change:

```bash
firebase functions:list --project eventech-2f278
```

---

## 6. Known gaps that outlive Phase 11

Carried from `FINAL_PHASES.md` §5, still open, each a deliberate decision rather
than an oversight:

- **Nothing releases a used ticket.** No un-check-in, and `cancelBooking`
  refuses approved bookings — a mistaken scan is fixable only in the console.
  This needs a real flow before live doors.
- **No scheduled expiry** for stale `pending_payment` bookings; they hold
  inventory indefinitely.
- **Receipt and QR download URLs are bearer tokens.** Firebase tokenised URLs
  bypass rules. The QR _token_ is separately HMAC-signed, so holding the image
  URL is not the same as being able to forge a ticket.
- **Storage is in `US-EAST1`** while Firestore is in Dammam. Receipts are
  financial documents. Moving it gets harder as files accumulate.
- **Event cover uploads are unmetered.** Any signed-in user can write under
  `events/{anyEventId}/cover/{their-uid}/`. The upload is orphaned unless
  `saveEventDraft` records it (which checks membership), so this is a storage
  cost vector, not a data one. Storage rules cannot rate limit; the budget alert
  in §4 is the control.
- **A staff member can read every ticket in their org**, including `qrToken`.
  Door staff need ticket reads, and the token is what a scanner validates — so
  this is an accepted insider risk, not a hole to close with rules.
- **Resend is off.** A real key also needs the `FROM` address in
  `functions/src/email/send-ticket-email.ts` moved off `tickets@evntech.com`,
  which is not a verified domain.
- **Light-theme contrast fails AA** on the `warning` (2.86), `success` (3.35)
  and `destructive` (4.00) badges and `muted-foreground` on `--surface` (4.40).
  Dark, the default, passes everywhere. Fixing it means changing canonical §8
  palette values, which `CLAUDE_TASKS.md` freezes — an owner decision.
- **`pnpm lint` reports ~900 phantom errors** from `.next` build output inside
  `.claude/worktrees/`. `.next/**` in `globalIgnores` only anchors at the repo
  root. Adding `.claude/**` fixes it; `eslint.config.mjs` is hook-protected.

---

## 7. Rollback

Functions and rules deploy together but roll back separately.

- **Rules**: Firebase Console → Firestore → Rules → history → republish a prior
  version. Instant.
- **Functions**: redeploy the previous commit. There is no version pinning in
  this project.
- **App Check**: unset `APPCHECK_ENFORCE` and redeploy, or turn enforcement off
  per-product in the console — the console switch is faster and is the one to
  reach for if enforcement is rejecting real users.
- **Indexes**: adding one is safe; deleting one breaks any query that needed it.
  Check `firestore.indexes.json` against the live set before removing anything.
