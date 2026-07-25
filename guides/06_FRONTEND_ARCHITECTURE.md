# 06_FRONTEND_ARCHITECTURE.md

> **EvenTech Frontend Architecture**
>
> Version: 1.0

---

# Purpose

This document defines the frontend architecture, coding standards, project structure, libraries, naming conventions, performance strategy, and implementation rules.

Every frontend implementation must follow this document.

---

# Core Stack

Framework

* Next.js 15 (App Router)

Language

* TypeScript

Styling

* Tailwind CSS v4

Animations

* Motion (Framer Motion)

UI Foundation

* shadcn/ui

Premium Components

* 21st.dev

Animation Components

* ReactBits

Icons

* Lucide

Font

* Geist

---

# Forbidden Libraries

Do not use

* Material UI
* Bootstrap
* Chakra UI
* Ant Design

Reason

Maintain one consistent design language.

---

# Folder Structure

```text
src/
│
├── app/
│
├── components/
│
│   ├── ui/
│   ├── layout/
│   ├── dashboard/
│   ├── landing/
│   ├── event/
│   ├── organizer/
│   ├── attendee/
│   ├── admin/
│   ├── analytics/
│   ├── timeline/
│   ├── kanban/
│   ├── calendar/
│   ├── notifications/
│   ├── forms/
│   ├── shared/
│   └── animations/
│
├── hooks/
│
├── services/
│
├── providers/
│
├── lib/
│
├── types/
│
├── constants/
│
├── config/
│
├── store/
│
├── utils/
│
├── styles/
│
└── assets/
```

---

# App Router Structure

```text
app/

(public)

(auth)

(attendee)

(workspace)

(admin)

api/

layout.tsx

loading.tsx

error.tsx

not-found.tsx
```

---

# Route Groups

Public

Authentication

Attendee

Organizer Workspace

Admin

These route groups must remain isolated.

---

# Layout Hierarchy

Root Layout

↓

Public Layout

↓

Workspace Layout

↓

Admin Layout

↓

Page

↓

Section

↓

Component

---

# Component Architecture

Every component belongs to one category.

UI

Business

Layout

Feature

Animation

Chart

Form

Provider

---

# Component Naming

Examples

HeroSection

EventCard

BookingCard

ProfileHeader

AnalyticsWidget

TimelineNode

TaskDrawer

CalendarToolbar

NotificationCenter

Never use

Card2

Box

Component

Widget1

---

# Component Rules

Each component

Single responsibility

Strong typing

Reusable

Accessible

Animated

Documented

---

# UI Component Priority

Priority 1

shadcn/ui

↓

Priority 2

21st.dev

↓

Priority 3

ReactBits

↓

Priority 4

Custom Component

Never bypass this order.

---

# State Management

Use

React State

↓

Context

↓

Firestore Realtime

↓

Server Components

Avoid unnecessary global state.

Only introduce Zustand later if required.

---

# Data Fetching

Primary

Firebase SDK

Secondary

Server Components

Realtime

Firestore Listeners

---

# Forms

React Hook Form

Validation

Zod

Requirements

Client validation

Server validation

Accessible

Typed

---

# Styling Rules

Tailwind only.

No CSS frameworks.

Minimal custom CSS.

Use CSS variables where appropriate.

---

# Tailwind Rules

Never hardcode spacing.

Use design tokens.

Never hardcode colors.

Use semantic variables.

---

# Typography

Geist

Never import additional fonts.

---

# Icons

Lucide only.

Do not mix icon libraries.

---

# Images

Use Next.js Image.

Always optimize.

Lazy load below the fold.

Use blur placeholders.

---

# Motion System

Motion library

Motion (Framer Motion)

Rules

Spring first.

Transform instead of layout.

Opacity.

Translate.

Scale.

Shared transitions.

Avoid expensive animations.

---

# Page Transitions

Required.

Every major route transition should include

Shared Element

Fade

Blur

Layout animation

No flashing.

---

# Scroll Animations

Reveal

Stagger

Fade

Translate

Viewport detection

---

# Loading UX

Every page

Skeleton

Progressive rendering

Streaming where applicable

---

# Error Boundaries

Each route group

Own Error Boundary

Own Loading

Own Not Found

---

# Reusable Hooks

Examples

useAuth

useBookings

useCurrentEvent

useTimeline

useNotifications

useRealtimeCollection

useCurrentOrganization

useAnalytics

useMedia

---

# Services

Examples

auth.service.ts

booking.service.ts

event.service.ts

ticket.service.ts

notification.service.ts

analytics.service.ts

storage.service.ts

---

# Providers

AuthProvider

ThemeProvider

CommandPaletteProvider

NotificationProvider

MotionProvider

RealtimeProvider

---

# Utilities

date.ts

currency.ts

maps.ts

validators.ts

qr.ts

permissions.ts

animations.ts

storage.ts

---

# Feature Modules

Each feature owns

Components

Hooks

Types

Services

Utilities

Constants

Never scatter feature logic.

---

# Theme Architecture

Light

Dark

System

No third-party themes.

---

# Accessibility

Keyboard

ARIA

Focus

Reduced Motion

Semantic HTML

Required on every page.

---

# Responsive Strategy

Mobile First

Breakpoints

Phone

Tablet

Laptop

Desktop

Ultra Wide

No desktop-only features.

---

# Charts

Use

Recharts

or

Tremor components if compatible.

Animations should follow Motion guidelines.

---

# Calendar

Use

FullCalendar

Completely restyled.

Must not resemble default FullCalendar.

---

# Drag and Drop

Use

dnd-kit

Never react-beautiful-dnd.

---

# Notifications

Floating

Animated

Grouped

Realtime

Glass style

---

# Command Palette

Ctrl + K

Search

Navigation

Quick Actions

Create Event

Invite Staff

Approve Booking

Open Timeline

---

# Performance Strategy

Server Components

Streaming

Suspense

Lazy Imports

Code Splitting

Image Optimization

Dynamic Imports

Memoization when needed

---

# Lighthouse Targets

Performance

95+

Accessibility

100

SEO

100

Best Practices

100

---

# Code Standards

Strict TypeScript

No any

No duplicated logic

No inline business logic

No magic numbers

Reusable utilities

Small functions

Descriptive names

---

# Documentation

Every reusable component should include

Purpose

Props

Example

Accessibility Notes

Dependencies

---

# Testing Preparation

Architecture must support

Unit Tests

Integration Tests

E2E Tests

Visual Regression

Even if tests are added later.

---

# Frontend Rule

The frontend should feel handcrafted, not generated.

Every screen must reinforce the identity of EvenTech:

**A premium production workspace for world-class event organizers.**
