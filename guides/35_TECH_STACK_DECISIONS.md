# 35_TECH_STACK_DECISIONS.md

> **EvenTech Engineering Decisions**
>
> **Technology Selection & Architectural Rationale**
>
> Version: 1.0

---

# Purpose

This document explains **why** each technology was selected.

Future contributors should understand the reasoning before replacing or introducing any dependency.

A new dependency should only be added if it clearly improves the product without compromising consistency, performance, or maintainability.

---

# Core Philosophy

Every technology must satisfy at least one of these goals:

* Improve developer experience
* Improve user experience
* Improve scalability
* Improve maintainability
* Improve performance

If it satisfies none of these, it should not be included.

---

# Frontend Framework

## Next.js 15 (App Router)

Reason

* Server Components
* Streaming
* Route Groups
* Layouts
* Metadata API
* Excellent performance
* Vercel-native deployment

Rejected Alternatives

* Remix
* Astro
* React Router
* Nuxt

---

# Language

## TypeScript

Reason

* End-to-end type safety
* Better refactoring
* Safer AI-generated code
* Improved autocomplete
* Lower maintenance cost

Strict mode is mandatory.

---

# Styling

## Tailwind CSS v4

Reason

* Design tokens
* Utility-first
* Excellent performance
* Easy theming
* Strong ecosystem

Rejected

* Styled Components
* Emotion
* CSS Modules for feature styling

---

# Component Library

Priority

```text id="svfmrh"
1. shadcn/ui

2. 21st.dev

3. ReactBits

4. Custom Components
```

Reason

Avoid rebuilding solved UI problems.

---

# Motion

## Motion

Reason

* Modern API
* React-first
* Shared element transitions
* Layout animations
* Excellent performance

Rejected

* GSAP
* Anime.js
* Pure CSS animations

---

# Icons

Lucide

Reason

* Lightweight
* Consistent
* Tree-shakable
* Beautiful stroke style

---

# Backend

Firebase

Reason

* Realtime Firestore
* Authentication
* Cloud Functions
* Storage
* Serverless scaling
* Excellent MVP velocity

Future Migration Path

Cloud Run

or

NestJS

if business requirements evolve.

---

# Database

Cloud Firestore

Reason

* Realtime
* Horizontal scaling
* Tight Firebase integration
* Flexible document model
* Excellent for collaborative workflows

Trade-offs

* No SQL joins
* Requires denormalized data

Accepted.

---

# Authentication

Firebase Auth

Reason

* Secure
* Mature
* Easy social login
* Strong SDK support

---

# File Storage

Firebase Storage

Reason

* Secure uploads
* Signed URLs
* Tight integration
* Scalable

---

# Server Logic

Cloud Functions Gen2

Reason

* Serverless
* Autoscaling
* Event-driven
* TypeScript support

Handles

* QR generation
* Booking approval
* Email delivery
* Scheduled jobs
* Permission enforcement

---

# Email

Resend

Reason

* Modern API
* Reliable delivery
* Great developer experience
* React Email compatibility

---

# Maps

Google Maps

Reason

* Venue search
* Geocoding
* Reliable global coverage

Future

Mapbox may be evaluated if licensing or customization needs change.

---

# Forms

React Hook Form

*

Zod

Reason

* Performance
* Type inference
* Validation
* Excellent developer experience

---

# State Management

## Firestore

Business state.

## Zustand

UI state.

## React

Local state.

Reason

Each tool solves a specific problem.

---

# Data Fetching

Realtime Firestore listeners.

Server Components where possible.

No unnecessary client fetching.

---

# Charts

Preferred

Recharts

Reason

* React-native API
* Lightweight
* Responsive

Future evaluation

Tremor

or

Visx

for advanced analytics.

---

# Drag and Drop

dnd-kit

Reason

* Accessible
* Flexible
* Excellent performance

Supports

Kanban

Timeline

Calendar

Future planner features.

---

# Tables

TanStack Table

Reason

* Headless
* Highly customizable
* Great performance

---

# Date Handling

date-fns

Reason

* Tree-shakable
* Immutable
* Lightweight

Rejected

Moment.js

---

# Validation

Zod

Single source of truth

Frontend

↓

Backend

↓

Cloud Functions

---

# Testing (Future)

Unit

Vitest

Component

React Testing Library

E2E

Playwright

---

# Linting

ESLint

Formatting

Prettier

Commit Quality

Husky

lint-staged

---

# Package Manager

pnpm

Reason

* Faster installs
* Better disk efficiency
* Workspace support

---

# Deployment

Frontend

Vercel

Backend

Firebase

Reason

Minimal operational overhead.

---

# Monitoring (Future)

* Firebase Performance
* Sentry
* Vercel Analytics

---

# AI Development

Primary

Claude Code

Secondary

Cursor

Supporting

* Fable
* Windsurf
* GitHub Copilot

All AI-generated code must comply with the project's architecture documents.

---

# Dependency Rules

Before installing a dependency ask

1. Does the platform already provide this?
2. Does an existing dependency solve it?
3. Can we build it in under one day?
4. Is the dependency actively maintained?
5. Is it tree-shakable?
6. Is it TypeScript-first?
7. Does it fit the architecture?

Only install if the answers justify it.

---

# Technology Lifecycle

Every dependency should be reviewed periodically for

* Maintenance status
* Security
* Bundle impact
* Community adoption
* Compatibility with React and Next.js

---

# Performance Principles

Prefer

Native browser APIs

↓

React

↓

Small focused libraries

↓

Large frameworks (only when necessary)

---

# Future Evolution

The architecture should support future additions such as

* Native mobile apps
* Desktop application (Tauri)
* Public REST/GraphQL API
* AI-powered event planning
* White-label organizations
* Plugin ecosystem
* Enterprise features

without major rewrites.

---

# Final Principle

Technology is never chosen because it is fashionable.

Every dependency must earn its place.

The simplest solution that satisfies the long-term product vision is always preferred over the most complex or most popular one.

EvenTech's competitive advantage comes from engineering quality, user experience, and execution—not from the number of technologies it uses.
