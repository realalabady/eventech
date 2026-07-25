# 03_DESIGN_SYSTEM.md

> **EvenTech Design System**
>
> Version: 1.0

---

# Purpose

The EvenTech Design System ensures every screen, component, animation, and interaction follows one unified visual language.

Every component must be reusable.

Every page must feel like it belongs to the same product.

---

# Design Philosophy

EvenTech is built around five principles.

* Clarity
* Consistency
* Motion
* Accessibility
* Performance

Every design decision must satisfy these principles.

---

# Design Inspiration

Inspired by

* Luma
* Linear
* Apple
* Arc Browser
* Stripe
* Notion
* Spotify

Never copy.

Only adopt design philosophies.

---

# Component Priority

Always build UI using the following priority.

## Level 1

shadcn/ui

Base UI library.

---

## Level 2

21st.dev

Premium production-ready UI.

---

## Level 3

ReactBits

Advanced animations.

Interactive components.

Premium visual effects.

---

## Level 4

Custom Components

Only when absolutely necessary.

Every custom component must be reusable.

---

# Design Tokens

## Radius

```text
xs = 8px
sm = 12px
md = 16px
lg = 20px
xl = 24px
2xl = 28px
pill = 9999px
```

---

## Spacing

```text
4
8
12
16
20
24
32
40
48
64
80
96
120
160
```

No custom spacing values.

---

## Shadows

Small

Cards

Medium

Dialogs

Large

Floating Panels

Never use heavy shadows.

---

## Borders

Border width

1px

Border color

Neutral only.

No decorative borders.

---

# Elevation

Level 0

Background

Level 1

Cards

Level 2

Floating Panels

Level 3

Dialogs

Level 4

Command Palette

Every elevation increases blur slightly.

---

# Responsive Breakpoints

```text
Mobile

0–767

Tablet

768–1023

Laptop

1024–1439

Desktop

1440+

Ultra Wide

1920+
```

---

# Layout Rules

Every page follows

Maximum width

1200px

Hero

1400px

Reading width

720px

Section spacing

120px

Container padding

32px desktop

24px tablet

16px mobile

---

# Page Structure

Every page follows

Navigation

↓

Hero

↓

Primary Content

↓

Supporting Sections

↓

Call To Action

↓

Footer

---

# Section Rules

Every section has

Headline

↓

Supporting text

↓

Primary action

↓

Visual content

Never begin with a wall of text.

---

# Cards

Every card must include

Rounded corners

Soft shadow

Hover animation

Transition

Large spacing

Consistent typography

Optional glass mode

---

# Card Variants

Information

Statistics

Event

Profile

Dashboard

Media

Analytics

Booking

Task

Timeline

---

# Buttons

Primary

Filled

Secondary

Outline

Ghost

Danger

Icon

Loading

Disabled

No additional variants.

---

# Inputs

Text

Email

Password

Phone

Search

Textarea

Select

Combobox

Date

Time

Number

Upload

Color

Tag

Checkbox

Radio

Switch

OTP

---

# Navigation

Top Navigation

Landing page

Sidebar

Dashboard

Bottom Navigation

Mobile only

Breadcrumbs

Required

---

# Tables

Tables must support

Search

Filters

Sorting

Pagination

Selection

Bulk actions

Responsive collapse

---

# Empty States

Every module requires

Illustration

Title

Description

Primary CTA

Secondary CTA

---

# Loading States

Never use blank screens.

Use

Skeletons

Progressive loading

Optimistic updates

---

# Error States

Every error includes

Explanation

Recovery

Retry

Support link

---

# Modal Rules

Use only when necessary.

Large workflows must use dedicated pages.

---

# Drawer Rules

Use drawers for

Quick editing

Preview

Comments

Details

---

# Tooltips

Maximum

2 lines

Helpful only.

Never repeat labels.

---

# Command Palette

Required

Shortcut

Ctrl + K

Capabilities

Search

Navigate

Create

Open

Filter

Actions

---

# Search Experience

Global Search

Events

Users

Organizations

Tasks

Artists

Venues

Bookings

Settings

Recent searches

---

# Theme Support

Light Mode

Required

Dark Mode

Required

System Mode

Required

---

# Dark Mode

Not an inverted interface.

Every surface should be redesigned.

No pure black backgrounds.

---

# Motion Rules

Everything animates.

Nothing distracts.

Animation duration

Fast

150ms

Default

250ms

Medium

400ms

Large

600ms

Page

700ms

---

# Animation Types

Allowed

Fade

Scale

Slide

Blur

Shared Elements

Spring

Opacity

Height

Width

Layout

Forbidden

Bounce

Flash

Shake

Spin

Random rotations

---

# Hover Rules

Cards

Lift

Buttons

Glow

Inputs

Border transition

Images

Zoom

Icons

Translate

---

# Scroll Behavior

Smooth scrolling

Required

Scroll reveal

Required

Section transitions

Required

Sticky navigation

Required

---

# Dashboard Rules

Dashboard is a workspace.

Never a spreadsheet.

Primary layout

Sidebar

↓

Header

↓

Workspace

↓

Inspector Panel

Optional

---

# Dashboard Widgets

Timeline

Kanban

Analytics

Calendar

Activity Feed

Bookings

Tasks

Quick Actions

Notifications

---

# Timeline Widget

Animated

Progressive

Interactive

Clickable

Connected to workflow

Real-time updates

---

# Kanban

Built using dnd-kit.

Features

Drag

Drop

Filters

Search

Labels

Members

Due dates

Animations

Realtime sync

---

# Calendar

Built using FullCalendar.

Fully customized UI.

Integrated with

Tasks

Events

Deadlines

Bookings

---

# Live Activity Feed

Realtime Firestore listener.

Displays

Bookings

Approvals

Tasks

Comments

Check-ins

Messages

Updates

---

# Analytics Cards

Animated counters

Trend indicators

Realtime updates

Responsive

---

# Accessibility

Keyboard support

Required

Screen readers

Required

Focus states

Required

Reduced motion

Required

ARIA

Required

Semantic HTML

Required

---

# Performance Rules

Lazy loading

Required

Code splitting

Required

Image optimization

Required

Dynamic imports

Required

Prefetching

Required

Streaming where appropriate

Required

---

# Component Naming

Component names must follow

Feature + Component

Examples

EventCard

BookingCard

TimelineWidget

AnalyticsChart

TaskDrawer

ProfileHeader

OrganizerHero

Never use generic names like

Card1

Box

Widget

Container

---

# Definition of Complete Component

A component is complete only when it includes

Responsive behavior

Dark mode

Loading state

Empty state

Error state

Accessibility

Animation

Type safety

Documentation

Tests (future)

Reusability

---

# Design System Rule

Every new feature must reuse the existing design system before introducing anything new.

If a required component does not exist, add it to the design system first, then use it throughout the application.

The design system is the single source of truth for the EvenTech user interface.
