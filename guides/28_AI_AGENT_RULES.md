# 28_AI_AGENT_RULES.md

> **EvenTech AI Development Constitution**
>
> **This document MUST be loaded before any AI agent writes code.**
>
> Applies to:
>
> * Fable
> * Claude Code
> * Cursor
> * Windsurf
> * GitHub Copilot
> * Gemini CLI
> * OpenAI Codex
> * Any autonomous coding agent

---

# Mission

You are not building a CRUD application.

You are building **EvenTech**.

EvenTech is a **premium Event Production Operating System** focused on the music industry, designed to become the world's best event management platform.

Every architectural and design decision must reinforce this mission.

---

# Core Philosophy

Optimize for:

* User experience
* Developer experience
* Scalability
* Maintainability
* Performance
* Accessibility
* Motion
* Realtime collaboration

Never optimize for writing less code.

Optimize for building the right product.

---

# Product Vision

The organizer should feel like they are operating a professional production studio.

The attendee should feel like they are using a premium consumer application.

The super admin should feel like they are managing an operating system.

---

# Technology Stack (Locked)

## Frontend

* Next.js 15 (App Router)
* React 19
* TypeScript
* Tailwind CSS v4
* Motion
* shadcn/ui
* 21st.dev
* ReactBits
* Lucide Icons

## Backend

* Firebase Authentication
* Cloud Firestore
* Firebase Storage
* Firebase Cloud Functions Gen2
* Firebase App Check

## Infrastructure

* Vercel
* Resend
* Google Maps

Do not replace any technology.

---

# Component Priority

Always search in this order before creating UI.

```text id="1mt9rn"
shadcn/ui

↓

21st.dev

↓

ReactBits

↓

Custom Component
```

Never rebuild components that already exist.

---

# Design Priority

The UI should feel closer to

* Luma
* Linear
* Arc
* Apple
* Framer

than to

* Bootstrap
* Material UI
* AdminLTE
* Generic dashboards

---

# Motion Philosophy

Motion communicates.

It never decorates.

Every animation must improve understanding.

Required:

* Shared element transitions
* Page transitions
* Hover feedback
* Loading skeleton transitions
* Animated counters
* Smooth drag-and-drop
* Timeline progression
* Floating notifications

Never use distracting animations.

---

# Firebase Rules

Firestore is the source of truth.

Never duplicate Firestore data in Zustand.

Never trust frontend permissions.

Every privileged action goes through Cloud Functions.

---

# Security Rules

Always validate

Authentication

↓

Role

↓

Organization membership

↓

Ownership

↓

Business rules

↓

Execution

Never expose sensitive logic to the client.

---

# Folder Structure

```text id="8mjlwm"
app/

components/

features/

hooks/

lib/

firebase/

services/

functions/

types/

constants/

styles/
```

Never create parallel architectures.

---

# Code Quality Rules

Every file must be

* Strict TypeScript
* Named exports
* Small
* Reusable
* Documented where necessary

Maximum recommended component size

300 lines

Split large components.

---

# Reusability Rules

Before writing code ask

1. Does this already exist?

2. Can it become reusable?

3. Can it be composed?

4. Does it belong in the design system?

---

# Accessibility Rules

Everything must support

* Keyboard navigation
* Focus management
* Screen readers
* Reduced motion
* WCAG AA

Accessibility is mandatory.

---

# Performance Rules

Target

Lighthouse

95+

Avoid

Unnecessary listeners

Large bundles

Blocking renders

Unoptimized images

Waterfall requests

---

# Styling Rules

Never

* Hardcode colors
* Hardcode spacing
* Hardcode radius
* Hardcode shadows

Always use design tokens.

---

# Firestore Rules

Optimize for reads.

Use batched writes.

Use transactions where consistency matters.

Avoid unnecessary realtime listeners.

Always unsubscribe.

---

# Forms

Use

React Hook Form

*

Zod

No exceptions.

---

# State Management

Business State

Firestore

UI State

Zustand

Temporary State

React

URL State

Search params

---

# Error Handling

Every async operation must include

Loading

↓

Success

↓

Failure

↓

Recovery

↓

Retry

Never leave the user confused.

---

# Notifications

Use

Floating notifications

Grouped

Non-blocking

Context aware

Avoid modal interruptions.

---

# Naming Rules

Components

PascalCase

Hooks

useSomething

Utilities

camelCase

Files

kebab-case

Collections

camelCase

---

# Git Rules

Branches

```text id="q0g6po"
feature/*

bugfix/*

hotfix/*

release/*
```

Every feature requires a Pull Request.

---

# AI Development Workflow

Before implementing any feature:

1. Read all relevant documentation.
2. Check for existing reusable components.
3. Verify design system compliance.
4. Implement.
5. Test responsiveness.
6. Verify accessibility.
7. Verify animations.
8. Verify Firebase integration.
9. Optimize performance.
10. Document if needed.

Never skip these steps.

---

# Forbidden Actions

Never

❌ Create duplicate components

❌ Ignore the design system

❌ Ignore the motion system

❌ Use inline CSS

❌ Introduce another UI framework

❌ Store secrets in the client

❌ Put business logic in React components

❌ Break folder conventions

❌ Build "quick fixes" that compromise architecture

---

# Success Checklist

A feature is complete only if it is

✓ Functional

✓ Beautiful

✓ Responsive

✓ Accessible

✓ Animated

✓ Typed

✓ Secure

✓ Realtime where appropriate

✓ Production-ready

---

# Decision Framework

Whenever unsure, choose the option that

* Improves UX
* Reduces complexity
* Increases reusability
* Preserves consistency
* Aligns with the design system
* Scales to millions of users

---

# Product Standard

Ask this question before shipping:

> **Would this interaction feel natural inside Luma, Linear, or Apple's own software?**

If not,

redesign it.

---

# Final Directive

You are not writing code.

You are designing a long-term software platform.

Every line of code should move EvenTech closer to becoming the **operating system for the global event industry**.

Do not chase shortcuts.

Do not sacrifice architecture for speed.

Build slowly.

Build correctly.

Build beautifully.

Build EvenTech.
