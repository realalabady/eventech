# 30_PROJECT_STRUCTURE.md

> **EvenTech — Complete Monorepo Structure**
>
> Version: 1.0
>
> This document defines the exact folder architecture of the project. Every AI agent and every developer must follow this structure without deviation.

---

# Philosophy

The folder structure should answer three questions immediately:

1. Where does this code belong?
2. Who owns this code?
3. Can another engineer find it in under 30 seconds?

The architecture favors **feature-first organization** while keeping shared infrastructure centralized.

---

# Tech Stack

* Next.js 15 (App Router)
* React 19
* TypeScript
* Tailwind CSS v4
* Firebase
* Motion
* shadcn/ui
* ReactBits
* 21st.dev

---

# Root Structure

```text
eventech/

├── app/
├── components/
├── features/
├── firebase/
├── functions/
├── hooks/
├── lib/
├── services/
├── store/
├── styles/
├── types/
├── utils/
├── constants/
├── config/
├── public/
├── docs/
├── scripts/
├── middleware.ts
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

---

# app/

```text
app/

(auth)

(dashboard)

(marketing)

(admin)

api/

layout.tsx

loading.tsx

error.tsx

not-found.tsx

globals.css
```

Use Route Groups extensively.

---

# Route Groups

```text
(auth)

login

register

forgot-password

verify-email

------------------------

(marketing)

home

pricing

about

contact

discover

------------------------

(dashboard)

attendee

organizer

organization

events

bookings

tickets

analytics

calendar

kanban

timeline

settings

------------------------

(admin)

dashboard

users

organizations

events

reports

audit

feature-flags
```

---

# features/

Every business domain owns itself.

```text
features/

auth/

booking/

calendar/

ticket/

organization/

event/

artist/

venue/

task/

timeline/

notification/

analytics/

messaging/

branding/

review/

favorite/

scanner/

admin/
```

Every feature contains

```text
components/

hooks/

services/

types/

utils/

validation/

firebase/

actions/
```

---

# components/

Only reusable UI.

Never business logic.

```text
components/

ui/

layout/

navigation/

motion/

cards/

forms/

charts/

tables/

dialogs/

shared/
```

---

# firebase/

```text
firebase/

client.ts

admin.ts

auth.ts

firestore.ts

storage.ts

app-check.ts

config.ts
```

---

# functions/

Cloud Functions.

```text
functions/

auth/

booking/

tickets/

emails/

notifications/

analytics/

scheduler/

organization/

events/

admin/

shared/
```

---

# hooks/

```text
hooks/

use-user.ts

use-auth.ts

use-organization.ts

use-events.ts

use-bookings.ts

use-calendar.ts

use-notifications.ts

use-media-query.ts

use-debounce.ts

use-command.ts
```

---

# services/

Pure business services.

```text
services/

auth.service.ts

booking.service.ts

event.service.ts

ticket.service.ts

organization.service.ts

storage.service.ts

analytics.service.ts
```

No React inside services.

---

# store/

Only UI state.

```text
store/

ui-store.ts

theme-store.ts

notification-store.ts

command-store.ts
```

Never duplicate Firestore.

---

# lib/

Infrastructure.

```text
lib/

motion/

validators/

date/

formatters/

permissions/

logger/

upload/

email/

qr/

search/
```

---

# types/

Global types.

```text
types/

user.ts

organization.ts

event.ts

booking.ts

ticket.ts

analytics.ts

notification.ts

task.ts
```

---

# utils/

Stateless helpers.

```text
utils/

cn.ts

currency.ts

date.ts

number.ts

slug.ts

download.ts

clipboard.ts
```

---

# constants/

```text
constants/

roles.ts

permissions.ts

routes.ts

colors.ts

breakpoints.ts

limits.ts

events.ts
```

---

# config/

```text
config/

firebase.ts

motion.ts

theme.ts

navigation.ts

seo.ts
```

---

# styles/

```text
styles/

globals.css

tokens.css

animations.css

utilities.css
```

Never create page-specific CSS files.

---

# public/

```text
public/

images/

icons/

logos/

illustrations/

fonts/

manifest/

favicon/
```

---

# docs/

Contains every architecture document.

```text
docs/

01_PRODUCT_VISION.md

02_PRODUCT_REQUIREMENTS.md

...

30_PROJECT_STRUCTURE.md
```

The docs folder is the project's source of truth.

---

# scripts/

Automation.

```text
scripts/

seed.ts

generate-icons.ts

resize-images.ts

cleanup.ts

backup.ts
```

---

# Naming Conventions

Folders

```text
kebab-case
```

Components

```text
PascalCase.tsx
```

Hooks

```text
useSomething.ts
```

Utilities

```text
camelCase.ts
```

Types

```text
something.ts
```

---

# Import Rules

Preferred

```ts
import { Button } from "@/components/ui/button";
```

Never

```ts
../../../components/ui/button
```

Always use path aliases.

---

# Ownership Rules

Each feature owns

* Components
* Hooks
* Services
* Validation
* Firebase access
* Actions

Shared code belongs outside features.

---

# Maximum File Sizes

Component

300 lines

Hook

200 lines

Utility

150 lines

Service

250 lines

Cloud Function

250 lines

Split before exceeding limits.

---

# Dependency Direction

```text
App

↓

Features

↓

Components

↓

Lib

↓

Utilities
```

Never reverse dependencies.

---

# Architecture Rules

Features cannot directly depend on each other.

Instead

```text
Shared Service

or

Shared Library
```

---

# Documentation Rule

Every new feature must include

* README
* Types
* Validation
* Service
* Tests (future)
* Documentation updates

---

# Code Review Checklist

Before merging

✓ Correct folder

✓ Correct naming

✓ Typed

✓ Accessible

✓ Responsive

✓ Animated

✓ No duplicated logic

✓ Uses design tokens

✓ Uses reusable components

✓ Cloud Function where required

---

# Scalability

This structure should comfortably support

* 100+ pages
* 500+ reusable components
* 1000+ Cloud Functions
* Millions of Firestore documents
* Multi-tenant organizations
* Future mobile applications
* Future public APIs

without requiring architectural changes.

---

# Final Principle

A great architecture makes large projects feel small.

Every engineer joining EvenTech should be able to understand the project structure within an hour and confidently contribute within a day.

The structure should scale not only with code, but with the team building it.
