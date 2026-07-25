# 31_FRONTEND_ARCHITECTURE.md

> **EvenTech Frontend Architecture**
>
> Version: 1.0
>
> This document defines how the frontend must be engineered, from rendering strategy to animations, component composition, routing, performance, and user experience.

---

# Vision

EvenTech should not feel like a dashboard.

It should feel like a **native desktop application running inside the browser**.

Every interaction should be immediate.

Every animation should communicate.

Every page should feel alive.

---

# Frontend Stack

## Framework

* Next.js 15 (App Router)
* React 19
* TypeScript

## Styling

* Tailwind CSS v4

## UI

* shadcn/ui
* ReactBits
* 21st.dev

## Motion

* Motion (Framer Motion successor)

## Icons

* Lucide

## Forms

* React Hook Form
* Zod

---

# Rendering Strategy

Use the appropriate rendering mode for every route.

| Route             | Strategy |
| ----------------- | -------- |
| Landing           | Static   |
| Marketing         | Static   |
| Discover          | ISR      |
| Event Details     | ISR      |
| Organizer Profile | ISR      |
| Dashboard         | Dynamic  |
| Calendar          | Dynamic  |
| Timeline          | Dynamic  |
| Kanban            | Dynamic  |
| Admin             | Dynamic  |

---

# Route Architecture

```text
/

discover

event/[slug]

organizer/[slug]

dashboard

dashboard/events

dashboard/bookings

dashboard/calendar

dashboard/timeline

dashboard/tasks

dashboard/settings

admin

admin/users

admin/events

admin/reports
```

---

# Layout Hierarchy

```text
Root Layout

↓

Marketing Layout

↓

Dashboard Layout

↓

Feature Layout

↓

Page

↓

Sections

↓

Components
```

Never duplicate layouts.

---

# Component Hierarchy

```text
Page

↓

Feature

↓

Container

↓

Card

↓

UI Components
```

Business logic never belongs in UI components.

---

# Page Composition

Every page follows

```text
Header

↓

Hero

↓

Primary Content

↓

Secondary Content

↓

Floating Actions

↓

Footer
```

Dashboard pages

```text
Top Navigation

↓

Quick Actions

↓

Metrics

↓

Workspace

↓

Activity

↓

Sidebar Widgets
```

---

# Navigation

Desktop

* Sidebar
* Top Navigation
* Command Palette

Mobile

* Bottom Navigation
* Drawer
* Floating Actions

---

# Motion System

Every page transition

* Fade
* Slight Scale
* Shared Element
* Blur Reduction

Card Hover

* Lift
* Glow
* Border Accent

Lists

* Stagger

Dialogs

* Scale
* Blur

Notifications

* Slide
* Fade

Drag

* Spring Physics

---

# Scroll Behavior

Smooth scrolling.

Sticky navigation.

Section reveal animations.

Preserve scroll position where appropriate.

---

# Skeleton Loading

Every page loads with skeletons.

Never show blank pages.

Skeletons should match the final layout.

---

# Empty States

Every empty state includes

* Illustration
* Helpful message
* Primary CTA

Example

"No events yet"

↓

"Create your first event"

---

# Error States

Every error screen explains

* What happened
* Suggested recovery
* Retry action

No raw error messages.

---

# Search Experience

Global Command Palette

Keyboard shortcut

```text
⌘ K

Ctrl K
```

Capabilities

* Search events
* Search tasks
* Search people
* Navigate
* Execute quick actions

---

# Responsive Strategy

Desktop First

↓

Tablet

↓

Mobile

↓

Foldables (future)

No hidden features on mobile.

Only adaptive layouts.

---

# Typography

Use Geist.

Large headings.

Generous spacing.

Readable line lengths.

Avoid dense text.

---

# Color Philosophy

Dark mode is primary.

Use light mode as an equally polished alternative.

Color indicates meaning, not decoration.

---

# Dashboard Philosophy

The organizer dashboard should resemble

* Linear
* Notion
* Monday
* Luma Studio

Never resemble a traditional admin panel.

---

# Animation Guidelines

Micro-interactions

100–150ms

Page transitions

250–400ms

Complex transitions

400–600ms

Never exceed 700ms.

---

# Charts

Charts should animate on first appearance.

Never animate repeatedly.

Support reduced motion.

---

# Images

Use Next.js Image.

Lazy load below the fold.

Blur placeholders.

Responsive sizes.

---

# Accessibility

Every page supports

* Keyboard navigation
* Screen readers
* Focus trapping
* Reduced motion
* High contrast

---

# Performance Budget

Initial JS

<250KB

LCP

<2.5s

INP

<200ms

CLS

<0.1

Route transitions

<700ms

---

# SEO Strategy

Marketing pages

Full SEO.

Open Graph.

Structured Data.

Canonical URLs.

Dashboard pages

No indexing.

---

# Design Rules

Never create screens from scratch.

Assemble them using

* Existing layouts
* Existing cards
* Existing sections
* Existing UI components

Consistency is more valuable than novelty.

---

# Feature Development Flow

Every feature follows

Research

↓

Design

↓

Component Reuse

↓

Implementation

↓

Motion

↓

Accessibility

↓

Optimization

↓

Testing

---

# Future Ready

The frontend architecture must support

* Mobile apps
* Desktop apps
* AI assistants
* Public API integrations
* White-label organizations
* Multi-language support
* Offline capabilities

without major rewrites.

---

# Final Principle

The frontend should disappear.

Users should never think about navigation, loading, or interface mechanics.

They should feel as though they are interacting directly with their events, team, and attendees.

A great frontend is invisible.

It simply lets people work.
