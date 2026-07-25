# 26_COMPONENT_ARCHITECTURE.md

> **EvenTech Component Architecture**
>
> Version: MVP 1.0

---

# Purpose

This document defines how every UI component in EvenTech is designed, organized, reused, and maintained.

The goal is to build a scalable component system that feels as polished as **Linear**, **Luma**, **Raycast**, and **Framer**, while preventing duplicated code.

---

# Philosophy

Every component must be

* Reusable
* Composable
* Accessible
* Animated
* Theme Aware
* Dark Mode Ready
* Fully Typed
* Tested Manually

---

# Component Priority

Before creating any new component, always follow this order:

```text id="6mg4db"
shadcn/ui

↓

21st.dev

↓

ReactBits

↓

Custom Component
```

If a component already exists, reuse it.

Never rebuild existing functionality.

---

# Component Categories

```text id="1njlwm"
UI

↓

Forms

↓

Navigation

↓

Feedback

↓

Data Display

↓

Dashboard

↓

Motion

↓

Layouts

↓

Feature Components
```

---

# Folder Structure

```text id="esczqa"
components/

    ui/

    layout/

    forms/

    navigation/

    dashboard/

    cards/

    charts/

    timeline/

    kanban/

    calendar/

    booking/

    ticket/

    organizer/

    attendee/

    analytics/

    admin/

    shared/
```

Feature-specific components should live inside their feature folder.

---

# UI Components

Use shadcn/ui whenever possible.

Includes

* Button
* Input
* Textarea
* Card
* Dialog
* Drawer
* Sheet
* Select
* Checkbox
* Radio
* Switch
* Tooltip
* Popover
* Badge
* Avatar
* Skeleton
* Alert
* Tabs
* Dropdown Menu
* Context Menu

Never fork these unless absolutely necessary.

---

# Layout Components

Global

* AppShell
* Sidebar
* Topbar
* Footer
* PageContainer
* SectionContainer
* SplitLayout
* GridLayout

---

# Navigation

Components

* Sidebar
* Breadcrumb
* Mobile Navigation
* Bottom Navigation
* Search Command
* User Menu
* Organization Switcher

---

# Forms

All forms use

* React Hook Form
* Zod

Common Components

* Text Field
* Email Field
* Password Field
* Phone Field
* Date Picker
* Time Picker
* File Upload
* Image Upload
* Color Picker
* Rich Text Editor

---

# Motion Components

Reusable wrappers

* Fade In
* Slide In
* Scale In
* Stagger Children
* Animated Counter
* Shared Element Transition
* Hover Lift
* Hover Glow
* Magnetic Button
* Page Transition

Every motion component should be configurable.

---

# Cards

Every card shares a common base component.

Examples

* Event Card
* Artist Card
* Venue Card
* Booking Card
* Task Card
* Analytics Card
* Team Member Card
* Notification Card

All cards inherit spacing, radius, hover behavior, and motion.

---

# Timeline Components

* Timeline
* Timeline Item
* Timeline Progress
* Timeline Connector
* Milestone Badge
* Progress Indicator

---

# Kanban Components

* Board
* Column
* Task Card
* Drag Overlay
* Add Task
* Column Header
* Task Labels

---

# Calendar Components

* Month View
* Week View
* Day View
* Agenda View
* Event Badge
* Time Grid

---

# Analytics Components

* Metric Card
* Area Chart
* Bar Chart
* Pie Chart
* Heatmap
* Trend Indicator
* KPI Summary

Charts should be lazy loaded.

---

# Booking Components

* Booking Card
* Receipt Preview
* Booking Status Badge
* Approval Dialog
* Rejection Dialog

---

# Ticket Components

* QR Display
* Ticket Card
* Event Summary
* Check-in Status
* Download Ticket (Future)

---

# Organizer Components

* Organization Header
* Branding Preview
* Theme Selector
* Gallery Manager
* Team List

---

# Attendee Components

* Upcoming Events
* Ticket Wallet
* Favorites Grid
* Booking History

---

# Admin Components

* User Table
* Organization Table
* Audit Timeline
* Feature Flag Toggle
* System Status

---

# Shared Components

* Empty State
* Error State
* Loading State
* Section Header
* Page Header
* Search Bar
* Filters
* Pagination
* Status Badge

---

# Component Rules

Every component must support

Hover

Focus

Keyboard Navigation

Loading

Disabled

Responsive Layout

Dark Mode

Accessibility

---

# Props Rules

Props should be

Minimal

Explicit

Strongly Typed

Avoid boolean overload.

Instead of

```ts id="bjsf3v"
primary={true}
```

Prefer

```ts id="ck7wjl"
variant="primary"
```

---

# Styling Rules

Never use inline styles.

Always use

Tailwind CSS

*

Design Tokens

*

Utility Variants

---

# Variant Strategy

Every reusable component supports variants.

Example

Button

* Primary
* Secondary
* Ghost
* Outline
* Destructive

Card

* Default
* Elevated
* Glass
* Interactive

Badge

* Success
* Warning
* Error
* Neutral

---

# Composition Rules

Prefer composition over inheritance.

Example

```text id="8u9gdn"
<Card>

  <CardHeader />

  <CardContent />

  <CardFooter />

</Card>
```

Not giant monolithic components.

---

# Accessibility Rules

Every component includes

ARIA Labels

Keyboard Support

Focus Ring

Reduced Motion

Screen Reader Support

---

# Performance Rules

Use

React.memo

only where profiling shows benefit.

Use

Dynamic Imports

for large components.

Virtualize long lists.

Lazy load charts.

---

# Naming Rules

Component

PascalCase

Hooks

useSomething

Utilities

camelCase

Files

kebab-case.tsx

---

# Documentation

Every reusable component includes

Purpose

Props

Usage Example

Variants

Accessibility Notes

---

# Testing Checklist

Before accepting a component

✓ Responsive

✓ Accessible

✓ Theme Aware

✓ Dark Mode

✓ Keyboard Navigation

✓ Motion

✓ No Console Errors

✓ Fully Typed

---

# Anti-Patterns

Never

❌ Create duplicate buttons

❌ Create duplicate cards

❌ Hardcode spacing

❌ Hardcode colors

❌ Mix component libraries randomly

❌ Couple UI with business logic

❌ Create giant 1000-line components

---

# Golden Rule

If two screens need similar UI,

extract a reusable component.

If three screens need it,

it belongs in the shared component library.

---

# Final Principle

The component library is the foundation of EvenTech.

Every screen should be assembled from a small set of polished, reusable, animated building blocks rather than custom one-off implementations.

This ensures consistency, maintainability, and the premium product experience that defines EvenTech.
