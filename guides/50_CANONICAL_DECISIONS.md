# 50 — CANONICAL DECISIONS

> **Authority: HIGHEST.**
> This document resolves every known conflict across guides 00–49.
> Wherever any other guide (or the README) disagrees with this document, **this document wins**.
> Where this document is silent, the majority position across the guides wins; where there is no majority, the dedicated-topic guide wins (39 for the wizard, 30 for project structure, 24 for state, 48 for testing).

Decided 2026-07-25 after a full review of all 50 docs. Product-shaping decisions were made by the project owner; technical resolutions follow majority-rule + best practice.

---

## 1. Locked Product Decisions (Owner)

1. **Build order** — organizer-first (47 + README), with 15's Marketing Website and Launch Hardening added as phases. 15's attendee-first order is rejected.
2. **Artists are full MVP citizens** — `artists` root collection, public `/artists` and `/artists/[slug]` pages, an Artists step in the event wizard, `artistIds[]` on events.
3. **Multiple ticket types in MVP** — per-event ticket tiers (name, price, quantity). Not a single price. (Early-bird/group/transfer/waitlist mechanics remain v2.0 per guide 20.)
4. **Dark-first theme** — dark is the default experience; light is fully supported and designed independently. (Overrides guide 02's light-only palette framing.)
5. **i18n from day 1 — zero hardcoded UI strings** (overrides guide 20's "i18n is future"). Library: **next-intl** with locale routing (`app/[locale]/`). Locales: `en` (default) + `ar` (RTL, GCC market). Every user-facing string lives in `messages/{locale}.json`, namespaced by feature (`auth.login.title`). `dir` is set per locale; layouts must be RTL-safe (logical CSS properties). ESLint enforces no JSX string literals. A test asserts locale files stay key-identical.

---

## 2. Build Order (12 Phases)

| # | Phase | Contents |
|---|-------|----------|
| 0 | Foundation | Repo, Next.js (16 at scaffold time — guides' "15" superseded by latest stable) + TS strict + Tailwind v4, Firebase project, tooling, CI |
| 1 | Design System | Tokens (§8), theme system, base components |
| 2 | Authentication | Login, registration, Google OAuth, onboarding, roles, protected routes |
| 3 | Organizer Foundation | Organization profiles, branding, team management, member roles |
| 4 | Event Management | 9-step wizard (§10), venues, artists, timeline generation, publishing |
| 5 | Marketing Website + Attendee Experience | Landing, about/contact/legal, discovery, search, event/organizer/artist public pages, favorites |
| 6 | Booking | Booking requests, bank details display, receipt upload, approval workflow |
| 7 | Tickets & Check-in | QR generation, Resend email delivery, ticket wallet, scanner + check-in |
| 8 | Production Tools + Analytics | Timeline, Kanban, calendar, team communication, activity feed, analytics dashboards |
| 9 | Super Admin | User management, organizer verification, reports/moderation, audit logs, feature flags |
| 10 | Polish | Motion pass, empty/error states audit, performance, accessibility audit |
| 11 | Launch Hardening | Security rules review, App Check enforcement, rate limiting, backups, monitoring, deployment checklist (49) |

Process rule (unchanged from 47/15/28): **never skip phases; each phase must be production-ready before the next begins.**

---

## 3. Roles & Identity

### Account roles — Firebase Custom Claims, written ONLY by Cloud Functions
```
attendee | organizer | admin
```
- UI labels: "Attendee", "Organizer", "Super Admin". The word **"Host" is retired** — always "Organizer" in code and UI.
- Claims payload: `{ role, organizationId? }`.

### Organization member roles — `organizationMembers` docs, drive permissions
```
owner | manager | staff | scanner
```
- **Designer / Finance / Security / Marketing are display-only *titles*** (a free-text/enum `title` field on the member), NOT permission roles. This reconciles guides 39/41 with 14/17/21.
- `scanner` is a first-class permission role (check-in access only).

### Flows
- Signup creates an **attendee** account. Organizers use "Create Organizer Account" which also creates the Organization and assigns `owner`.
- **Attendee → Organizer upgrade is allowed** via a "Become an organizer" flow (Cloud Function creates org + updates claims).
- **Profile creation happens in a callable Cloud Function during onboarding** — NOT an `onCreate(auth.user)` trigger (guide 44's Gen-1 syntax is invalid under Gen 2).
- **Unverified organizers CAN publish events and accept bookings.** Admin verification grants the verified badge + better discovery placement only. Email verification (not admin verification) gates: publishing, booking approval, financial actions (guide 38).

---

## 4. Canonical Enums

```ts
type EventStatus   = "draft" | "planning" | "published" | "live" | "completed" | "cancelled" | "archived";
type BookingStatus = "pending_payment" | "pending_review" | "approved" | "rejected" | "expired" | "cancelled";
type TicketStatus  = "active" | "used" | "cancelled";
type TaskStatus    = "todo" | "in_progress" | "review" | "done";
type TaskPriority  = "low" | "medium" | "high";
type MemberRole    = "owner" | "manager" | "staff" | "scanner";
type AccountRole   = "attendee" | "organizer" | "admin";
```

- Kanban columns = task statuses: **To Do / In Progress / Review / Done** (overrides all other column lists in 04/16/17/23/41).
- All six event-lifecycle diagrams (00/14/17/23/39/41) collapse to `EventStatus` above. "Selling" is not a status — it is `published` with `bookingOpen == true`.
- Ticket `pending` (17) is removed — tickets are only created at approval, as `active`. `expired` tickets are v2.
- The two-state booking problem in guide 40 is fixed: `pending_payment` (created, no receipt) → `pending_review` (receipt uploaded) → decision.

---

## 5. Firestore Data Model

### Topology: ROOT collections (21 + 25 model wins over 08/36 subcollections)

```
users, organizations, organizationMembers, events, bookings, tickets, checkins,
artists, venues, tasks, timeline, calendarEvents, notifications, channels, messages,
activityLogs, analytics, reviews, favorites, auditLogs, featureFlags, systemSettings
```

Guide 08's extra collections (`activities`, `invites`, `media`, `categories`, `tags`, `system`) are dropped or folded in: activity → `activityLogs`, invites → `organizationMembers` with `status:"invited"`, categories → constants in code for MVP.

### Canonical field decisions
| Question | Winner |
|---|---|
| Booking owner field | `attendeeId` (not `userId`) |
| QR fields on ticket | `qrToken` (signed) + `qrImage` (storage URL) |
| Event inventory | `availableTickets` / `soldTickets` (aggregates across types) |
| Venue | `venues` root collection + `venueId` on event (NOT embedded — overrides 36) |
| Bank details | **Organization-level** `payment: { bankName, iban, accountHolder }`; event may override with the same shape in the wizard Payment step |
| Activity log fields | `actorId, action, resourceType, resourceId, metadata, createdAt` (21's shape) |
| Timestamps | Every doc: `createdAt`, `updatedAt`. Soft-delete only where the product needs it (events → `archived`/`cancelled` status; NOT 08's global `deleted/version` mandate) |
| Collection naming | camelCase, plural |

### Ticket types (owner decision #3)
Embedded array on the event document:
```ts
ticketTypes: Array<{
  id: string;            // stable, generated
  name: string;          // "Standard", "VIP", ...
  price: number;
  currency: string;      // ISO 4217, e.g. "SAR"
  quantity: number;
  sold: number;
  description?: string;
}>
```
- All mutations to `ticketTypes[].sold` and event inventory happen **inside Cloud Function transactions only**.
- Booking carries `ticketTypeId`, `quantity`, `amount` (= price × quantity, computed server-side, never trusted from client).

### Booking flow (canonical, fixes guide 40's ambiguity)
1. `createBooking` (callable): validates auth + event `published` + `bookingOpen` + type availability → creates booking `pending_payment` with a generated `paymentReference`.
2. Client shows org bank details + amount + reference. Attendee transfers out-of-band.
3. Receipt upload to Storage → booking gets `payment: { receiptUrl, submittedAt }`, status → `pending_review`.
4. Organizer approves (capacity re-checked in transaction — approval is the true gate; pending bookings may oversubscribe) or rejects (reason required, stored, notified).
5. Approval fan-out (§6). `generateTicket` is **idempotent** — if the booking already has a ticket, return it.
6. Scheduler expires stale `pending_payment` bookings (`expired`).

### Required composite indexes (union of 08/36)
events(status,startDate) · events(organizationId,status) · bookings(eventId,status) · bookings(attendeeId,status) · tickets(eventId) · notifications(userId,read) · tasks(assigneeId,status,dueDate) · timeline(eventId,order) · activityLogs(eventId,createdAt)

---

## 6. Cloud Functions

**Runtime:** Node.js 22, TypeScript, **Gen 2**, single region (multi-region ready). Emulators mandatory in dev.

### Canonical names (resolves 09/22/25 vs 44/46)
- Auth/profile: `completeOnboarding` (callable — replaces auth onCreate trigger), `deleteUserData`, `assignUserRole` (admin-only)
- Organization: `createOrganization`, `inviteMember`, `acceptInvitation`, `removeMember`, `updateMemberRole`, `becomeOrganizer`
- Events: `createEvent` (also seeds timeline milestones + default tasks + activity log), `publishEvent` (SEO metadata + notifications), `updateEventStatus`, `archiveEvent`, `duplicateEvent`
- Booking: **`createBooking`** (not `createBookingRequest`), `approveBooking`, `rejectBooking`, `expirePendingBookings` (scheduler)
- Tickets: `generateTicket` (internal, on approval, idempotent), **`validateTicket`** (read-only check) and **`checkInTicket`** (marks used + writes `checkins` doc) remain **separate** (22/09 win over 44)
- Email (Resend **HTTP API**, not SMTP): `sendTicketEmail`, `sendBookingUpdateEmail`, `sendEventReminderEmail`, `sendNotificationEmail`
- Analytics: `updateDashboardMetrics` (Firestore triggers), `trackEventView`, `generateDailyAnalytics` (nightly)
- Admin: `verifyOrganizer`, `suspendUser`, `suspendOrganization`, `createAuditLog` (internal)
- Storage: `processUpload` (validate size/type/ownership), `optimizeImage`

### Error envelope (single contract; 22's vocabulary, `code` not `errorCode`)
```ts
{ success: boolean; code?: ErrorCode; message: string; data?: T }
// ErrorCode: AUTH_REQUIRED | PERMISSION_DENIED | INVALID_REQUEST | VALIDATION_ERROR |
//            NOT_FOUND | BOOKING_CLOSED | EVENT_FULL | ALREADY_EXISTS | INVALID_QR |
//            RATE_LIMITED | SERVER_ERROR
```

### Non-negotiables
- QR generation, ticket creation, ticket status changes, booking approval, role/claim writes, emails: **Cloud Functions ONLY. Never on the client.**
- Approval fan-out is mandatory and atomic in intent: ticket → QR → analytics → notification → email → activity feed.
- Every callable: authenticate → validate input (Zod) → check permission → verify org/event ownership → act → log → typed response.
- Auth model: **login/registration via Firebase SDK directly** (46 wins over 22's "auth Cloud Functions"). No custom JWT/session endpoints.

---

## 7. Security

- **Deny-by-default** Firestore + Storage rules.
- **Account role from custom claims; org-scoped permissions from `organizationMembers` lookups** (hybrid of 45 + 10 — claims for cheap admin/organizer checks, membership docs for owner/manager/staff/scanner granularity).
- Client can NEVER write: `role`, claims, `verified`, ticket `status`, booking `status`, analytics, `createdAt`, `createdBy`, `organizationId`, `attendeeId`, `ticketTypes[].sold`.
- Public unauthenticated reads: `published` events, organizer public profiles, artists, venues. (10 wins over 45's verified-only gate.)
- Receipts: booking owner + reviewing org members + admin only. QR images never public. Audit logs never client-readable.
- Org isolation: every protected doc carries `organizationId`; Org A can never read Org B. Admin bypass is always audited.
- Immutable fields, field-length caps, and the security-test suite from guide 10 apply.
- Uploads: 20 MB max, `jpg/png/webp` + `pdf` (receipts), validated in rules and `processUpload`.
- **App Check, rate limiting (22's numeric limits), daily Firestore backups: built compatible from day 1, ENFORCED at Phase 11.** (Resolves the now-vs-future contradictions in 10/25/28/36/45/49.)

---

## 8. Design Tokens

### Typography
- **Geist**, fallback `system-ui, sans-serif`. **Exactly 3 weights: 400 / 500 / 600.** (27+18 win; 02's 300–700 and 13's 800 rejected.)
- Product type scale (13 wins): Hero 64 · Display 48 · H1 40 · H2 32 · H3 24 · H4 20 · Body L 18 · Body 16 · Small 14 · Caption 12.
- 02's larger marketing sizes (Display 72, H1 56…) allowed **only on marketing pages**.
- Max line length 75ch. Reading width 720px.

### Layout
- **Max content width 1440px** (13/27/18 win over 03's 1200). Grid 12 / 8 / 4.
- Breakpoints (03): 0–767 mobile · 768–1023 tablet · 1024–1439 laptop · 1440+ desktop · 1920+ ultra-wide.
- Container padding: 32 desktop / 24 tablet / 16 mobile. Section spacing 120px on marketing pages.

### Spacing scale (union; 20 and 56 are legal)
```
4 8 12 16 20 24 32 40 48 56 64 80 96 120
```

### Radius
```
xs 8 · sm 12 · md 16 · lg 20 · xl 24 · 2xl 28 · pill 9999
```
Per-element (02 wins): **Cards 24 · Inputs 16 · Buttons pill · Images 24 · Dialogs 28.**

### Color — Dark-first. No pure black or pure white surfaces.
**Dark (default):**
```
background #0A0A0B · surface #111113 · card #16161A · border #26262B
text #F5F5F6 · muted #A1A1AA
```
**Light:**
```
background #FAFAFA · surface #F4F4F5 · card #FFFFFF · border #E4E4E7
text #18181B · muted #71717A
```
**Accents (defined here for the first time — no guide specified hex):**
| Token | Dark theme | Light theme | Use |
|---|---|---|---|
| primary (blue) | `#3B82F6` | `#2563EB` | actions, links, focus |
| success (emerald) | `#10B981` | `#059669` | approvals, valid scans |
| warning (amber) | `#F59E0B` | `#D97706` | pending states |
| danger (rose) | `#F43F5E` | `#E11D48` | rejections, destructive |
| info (sky) | `#38BDF8` | `#0284C7` | informational |
| accent (purple) | `#8B5CF6` | `#7C3AED` | creative highlights, branding studio |

- Semantic names: **Success / Warning / Danger / Info** (27's "Danger" wins over 13's "Error").
- Accents occupy **< 10% of any interface**. Never communicate by color alone.
- Gradients: soft mesh only. Background layering (13): gradient → noise → mesh glow → content.

### Effects
- Shadows: soft, diffused, layered; depth comes from spacing first. Scale: none/soft/medium/large/floating.
- Elevation: 0 background → 1 cards → 2 floating panels → 3 dialogs → 4 command palette (03 wins).
- **Glass ONLY on:** nav, dialogs, floating panels, notifications, search/command palette. **Never on forms, tables, or default cards** (27/34 win over 13/16). Glass card exists only as an explicit opt-in variant.
- Z-index ladder (27): base → dropdown → sticky → overlay → dialog → toast → tooltip.
- Icons: **Lucide only.** 20 default · 16 inline · 24 nav · 32 hero.
- Buttons: **Primary / Secondary / Ghost / Outline / Destructive**. Min touch target 44px.
- Accessibility: WCAG AA minimum, keyboard nav, visible focus, reduced motion — every component.

---

## 9. Motion

- Package: **`motion`** (`motion/react`) — the Framer Motion successor. Satisfies the README's intent. GSAP/Anime.js/CSS animation libraries banned (33).
- **Durations:** click ≤100 · hover 150 · modals/toasts 250 · page transitions **350** · medium 400 · hero/slow 600 · **hard ceiling 700ms** (33 wins; 12's 900/1200 rejected).
- **Easing:** `easeOut`, `easeInOut`, `spring` only. No `easeIn`, no `linear`, no custom beziers outside tokens.
- Animate only: opacity, transform, scale, small rotate, blur. Never width/height/top/left/margin/padding (sidebar collapse and accordion use transform/clip strategies or are the sanctioned exceptions — keep them 60fps).
- **Shake: allowed, only for form-validation errors, gentle** (12/33 win over 03's ban).
- Required moments: shared-element card→page transitions (event, organizer, artist, ticket) · skeleton shimmer loading (**never fullscreen spinners**) · dashboard stagger on first load · metrics count up **once** · charts animate **once** · QR approval reveal sequence · booking status progression.
- `prefers-reduced-motion` respected everywhere: strip parallax/particles/large transitions, keep small fades.
- Cursor effects (spotlight, magnetic buttons): marketing pages only, desktop only. No confetti in MVP.

---

## 10. Event Creation Wizard (canonical 9 steps)

```
1 Basic Info   (title, category, description, cover)
2 Venue        (pick/create venue → venueId)
3 Schedule     (dates, times, lineup schedule)
4 Artists      (pick/create artists → artistIds[])
5 Tickets      (ticket types: name, price, currency, quantity)
6 Branding     (colors, imagery, gallery)
7 Team & Tasks (assign members, seed tasks)
8 Payment      (confirm org bank details or per-event override)
9 Review & Publish
```
- Auto-save every step. Draft resumable. Publishing requires email verification and completeness checks.
- Categories (fixes 39's odd list): `Concert · Club Night · Festival · Live Band · Beach Party · Rooftop Party · Private Event`.

---

## 11. Frontend Architecture

- **Structure: guide 30 wins.** No `src/`. Feature-first:
  `app/ components/ features/ firebase/ functions/ hooks/ lib/ services/ store/ styles/ types/ utils/ constants/ config/ public/ docs/ scripts/`
- Features (each owns `components/hooks/services/types/validation/`): auth, organization, event, artist, venue, booking, ticket, scanner, task, timeline, calendar, notification, analytics, messaging, branding, review, favorite, admin. **Features never import each other** — shared code goes through `lib/`/`services/`. Path aliases only (`@/...`).
- Route groups: `(marketing)` `(auth)` `(attendee)` `(workspace)` `(admin)` — 04's route map **including** `/artists` and `/artists/[slug]`.
- Rendering (31): marketing = static · discover/event/organizer/artist pages = ISR · workspace/admin = dynamic.
- **State (24 wins; 06's "no Zustand" overridden):** URL → Firestore realtime listeners (source of truth, always unsubscribe) → local React state → **Zustand for UI state only** (`ui-store`, `notification-store`, `command-store`). Never mirror Firestore into Zustand. Optimistic UI allowed for kanban/favorites/theme; forbidden for payments/approvals/QR.
- Forms: React Hook Form + Zod everywhere; wizard autosaves every 5s or on blur.
- Responsive: public/attendee pages **mobile-first**; workspace/admin **desktop-first** (resolves 06 vs 31). Nothing removed on mobile, only reorganized; tables become cards; bottom nav on mobile.
- Naming: files `kebab-case.tsx` · components PascalCase **named exports** · hooks `use-something.ts` · semantic Feature+Component names (`EventCard`, never `Card1`).
- Size caps: component 300 · hook 200 · service 250 · cloud function 250 lines.
- Libraries: Recharts (lazy-loaded) · dnd-kit (never react-beautiful-dnd) · date-fns · FullCalendar fully restyled · **pnpm**. Forbidden: MUI, Bootstrap, Chakra, Ant.
- Component sourcing ladder: **shadcn/ui → 21st.dev → ReactBits → custom (last resort).**
- Perf budget (29/31): JS < 250KB initial · LCP < 2.5s · INP < 200ms · CLS < 0.1 · Lighthouse 95+.

---

## 12. Process & Quality

- **Testing starts now** (48 wins over "Tests: Future" notes in 07/30/35): Vitest (logic/validation) · React Testing Library (components) · Playwright (flows) · Firestore rules emulator tests. Regression suite before every release: auth, event creation, booking, ticket generation, admin actions.
- Per-feature loop (README/28/29): read docs → check reusable components → explain what & which files → implement current phase only → test → confirm.
- Definition of Done: functional · responsive · dark + light · loading/empty/error states · animated · accessible AA · strictly typed · secure (rules verified) · documented.
- Git: `feature/* → PR → develop → main`. Never hardcode colors/spacing/radius — tokens only. No business logic in UI components. No secrets in client code.
- Environments: dev (emulators) → staging → production (49). Deploy: Vercel (frontend) + `firebase deploy` (rules, indexes, functions, storage).
- Quality bar: *"Would this interaction feel natural inside Luma, Linear, or Apple's own software?"* If not, redesign.

---

## 13. Explicitly Rejected / Retired

| Rejected | In favor of |
|---|---|
| 15's attendee-first build order | §2 |
| 08/36 subcollection topology | §5 root collections |
| 36's embedded venue, event-level-only IBAN | `venueId`, org-level payment |
| `createBookingRequest`, merged validate/check-in (44) | `createBooking`, separate functions |
| Auth Cloud Functions returning JWT (22) | Firebase SDK auth (46) |
| `errorCode` envelope (46) | `code` (§6) |
| 12's 900/1200ms motion, cursor trails app-wide, confetti | §9 |
| 02's 300/700 weights, 13's 800 weight | 3 weights |
| 03's 1200px max width | 1440 |
| 13/16 glass-everywhere | §8 glass scope |
| 08's global soft-delete + `version` metadata | §5 timestamps rule |
| "Host" terminology | "Organizer" |
| Gen-1 `onCreate(auth.user)` trigger | onboarding callable |
| Resend SMTP | Resend HTTP API |
| 45's `conversations` collection | `channels` + `messages` |
