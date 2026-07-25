# README.md

# EvenTech — AI Build Documentation System

> Premium Event Management SaaS Platform
> Version: MVP 1.0

---

# 1. Project Overview

EvenTech is a next-generation event management platform designed for the music industry first, with future expansion into business events, conferences, festivals, and professional productions.

The platform connects:

```text
Attendees

↓

Event Hosts / Organizers

↓

EvenTech Super Admin
```

EvenTech is not a simple ticketing system.

It is an **event operating system** that helps organizers plan, manage, launch, and execute events professionally.

The product philosophy:

> "The organizer should feel like they are running a professional production studio, not filling forms."

---

# 2. Documentation Reading Order

Before writing any code, AI agents must read all documentation according to this order.

> **PRECEDENCE RULE:** Read `guides/50_CANONICAL_DECISIONS.md` FIRST.
> The guides were written in multiple passes and conflict in places (duplicate design systems, differing schemas/enums, etc.).
> Wherever any guide disagrees with `50_CANONICAL_DECISIONS.md`, the canonical decisions document **wins**.

All documentation lives flat in `guides/` as numbered files (00–50). The phases below map to the actual files.

---

## Phase 0 — Understanding The Product

Read:

```text
guides/

├── 50_CANONICAL_DECISIONS.md   ← always first
├── 00_MASTER_SPECIFICATION.md
├── 01_PRODUCT_VISION.md
├── 14_PRODUCT_REQUIREMENTS_DOCUMENT.md
└── 23_USER_FLOWS.md
```

Purpose:

Understand:

- Why EvenTech exists
- Who uses it
- What problems it solves
- Core workflows

---

# Phase 1 — Design System Understanding

Read:

```text
guides/

├── 02_BRAND_GUIDELINES.md
├── 03_DESIGN_SYSTEM.md  (+ 13, 27 — superseded by 50 where they conflict)
├── 12_MOTION_SYSTEM.md  (+ 33 — superseded by 50 where they conflict)
├── 34_DESIGN_INSPIRATION_SYSTEM.md
├── 18_UI_UX_RULEBOOK.md
├── 32_UI_UX_BIBLE.md
└── 05_USER_EXPERIENCE.md
```

Purpose:

Understand:

- Visual language
- Animations
- Component style
- User experience expectations

---

# Phase 2 — Technical Architecture

Read:

```text
guides/

├── 35_TECH_STACK_DECISIONS.md
├── 06_FRONTEND_ARCHITECTURE.md  (+ 31 — superseded by 50 where they conflict)
├── 30_PROJECT_STRUCTURE.md
├── 25_FIREBASE_ARCHITECTURE.md  (+ 36 — superseded by 50 where they conflict)
├── 21_DATABASE_SCHEMA.md        (+ 08 — superseded by 50 where they conflict)
├── 10_FIRESTORE_SECURITY_RULES.md
└── 24_STATE_MANAGEMENT.md
```

Purpose:

Understand:

- Technology choices
- Code structure
- Database design
- Security model

---

# Phase 3 — Product Features

Read:

```text
guides/

├── 38_AUTHENTICATION_FLOW.md
├── 39_EVENT_CREATION_WORKFLOW.md
├── 40_BOOKING_AND_TICKETING_FLOW.md
├── 42_ATTENDEE_APP_SPEC.md
├── 41_ORGANIZER_DASHBOARD_SPEC.md
├── 43_SUPER_ADMIN_SPEC.md
├── 17_FEATURE_SPECIFICATIONS.md
└── 16_UI_SCREEN_BLUEPRINTS.md
```

Purpose:

Understand:

- User journeys
- Screens
- Workflows
- Business logic

---

# Phase 4 — Backend Implementation

Read:

```text
guides/

├── 44_CLOUD_FUNCTIONS_SPEC.md   (+ 09 — superseded by 50 where they conflict)
├── 45_FIRESTORE_SECURITY_RULES_SPEC.md
└── 46_API_AND_SERVICE_CONTRACTS.md  (+ 22 — superseded by 50 where they conflict)
```

Purpose:

Understand:

- Backend logic
- Firebase functions
- Data security
- Service communication

---

# Phase 5 — Execution Plan

Read:

```text
guides/

├── 47_MVP_DEVELOPMENT_PHASES.md  (canonical 12-phase order is in 50)
├── 15_DEVELOPMENT_ROADMAP.md     (order superseded by 50; extra scope harvested)
├── 48_TESTING_AND_QA_PLAN.md
└── 49_DEPLOYMENT_AND_PRODUCTION_CHECKLIST.md
```

Purpose:

Understand:

- Development order
- Testing requirements
- Production launch process

---

# 3. Technology Requirements

The following technologies are mandatory.

Do not replace them unless explicitly requested.

---

# Frontend

Framework:

```text
Next.js
TypeScript
```

---

Styling:

```text
Tailwind CSS
```

---

UI Components:

Use:

```text
shadcn/ui

ReactBits

21st.dev
```

Do not create unnecessary custom components if a suitable component already exists.

---

Animation:

Use:

```text
Framer Motion
```

Required for:

- Page transitions
- Shared element animations
- Micro interactions
- Timeline animations
- Dashboard motion

---

# Backend

Use Firebase ecosystem:

```text
Firebase Authentication

Firestore Database

Firebase Storage

Firebase Cloud Functions Gen 2
```

---

# Email

Use:

```text
Resend SMTP
```

For:

- QR ticket delivery
- Notifications
- Event reminders

---

# 4. Design Direction

EvenTech visual identity should feel like:

```text
Luma

+

Linear

+

Apple

+

Framer
```

Do not copy designs.

Extract the principles:

- Premium
- Minimal
- Modern
- Cinematic
- Smooth
- Professional

---

# 5. Development Rules For AI Agents

Before implementing any feature:

The AI must:

1. Read the related documentation.
2. Explain what will be built.
3. Explain which files will change.
4. Implement only the current phase.
5. Test the implementation.
6. Confirm completion before moving forward.

---

# 6. Coding Rules

Follow these rules:

## Architecture

- Keep components reusable.
- Keep business logic outside UI components.
- Use clean folder structures.
- Avoid duplicated code.

---

## Frontend

Required:

- TypeScript strict mode
- Responsive design
- Accessible components
- Loading states
- Error states
- Empty states

---

## Firebase

Never:

- Trust frontend permissions.
- Store sensitive logic in client code.
- Allow direct modification of protected data.

Sensitive operations must use:

```text
Cloud Functions
```

---

# 7. Product Building Order

Build EvenTech in this order:

---

## Phase 1

Foundation

Build:

- Project setup
- Design system
- UI components
- Theme system

---

## Phase 2

Authentication

Build:

- Login
- Registration
- User profiles
- Roles
- Protected routes

---

## Phase 3

Organizer System

Build:

- Organization profiles
- Branding
- Team management

---

## Phase 4

Event Management

Build:

- Event creation
- Venue
- Timeline
- Publishing
- Public pages

---

## Phase 5

Attendee Experience

Build:

- Discovery
- Search
- Organizer profiles
- Event pages

---

## Phase 6

Booking System

Build:

- Booking requests
- Receipt upload
- Approval workflow

---

## Phase 7

Ticket System

Build:

- QR generation
- Email delivery
- Ticket wallet
- Check-in

---

## Phase 8

Production Dashboard

Build:

- Timeline
- Kanban
- Calendar
- Team communication
- Analytics

---

## Phase 9

Super Admin

Build:

- User management
- Organizer verification
- Reports
- Platform controls

---

# 8. User Experience Rules

Every interaction should feel:

- Fast
- Smooth
- Intentional

Avoid:

- Generic dashboards
- Heavy forms
- Old ERP-style interfaces
- Unnecessary popups

---

# 9. Required Motion Language

Every major experience should include:

- Smooth transitions
- Shared element animations
- Floating notifications
- Animated counters
- Progress animations
- Elegant loading states

Motion should communicate:

- Progress
- Feedback
- Connection

Not decoration.

---

# 10. Quality Standard

Before considering any feature complete:

It must satisfy:

```text
Functional

+

Secure

+

Responsive

+

Beautiful

+

Maintainable
```

---

# 11. Final AI Instruction

You are not generating a website.

You are building EvenTech as a production-grade SaaS product.

Think like:

- Senior frontend engineer
- Senior backend engineer
- Product designer
- UX engineer

Follow the documentation.

Build phase by phase.

Never sacrifice architecture for speed.

The final product should feel like a premium platform used by professional event organizers.

# 12. Repository Structure

```text
evntech/
│
├── README.md
│
└── guides/                     ← all documentation, flat, numbered 00–50
    │
    ├── 50_CANONICAL_DECISIONS.md   ← READ FIRST. Overrides all other guides on conflict.
    │
    ├── 00–01, 14, 23               → product context (vision, requirements, user flows)
    ├── 02–05, 12–13, 16, 18,       → design system, motion, UX rules,
    │   26–27, 32–34                  screen blueprints, component library
    ├── 06–10, 21–22, 24–25,        → tech architecture (frontend, Firebase,
    │   30–31, 35–36                  database, security, state, structure)
    ├── 11, 17, 38–43               → feature specifications
    ├── 09, 22, 44–46               → backend specifications
    ├── 15, 19–20, 28–29, 47–49     → development plan, AI agent rules, testing, deployment
    │
    └── (guide 37 does not exist — numbering skips it)
```
