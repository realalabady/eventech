# 18_UI_UX_RULEBOOK.md

> **EvenTech UI/UX Rulebook**
>
> Version: 1.0

---

# Purpose

This document contains the non-negotiable design and UX rules that every AI agent and developer must follow.

If any screen violates these rules, it must be redesigned before implementation.

---

# Philosophy

EvenTech is **premium software**.

Not enterprise software.

Not bootstrap software.

Not a CRUD dashboard.

The product should feel like using

* Linear
* Luma
* Arc Browser
* Raycast
* Framer
* Apple

---

# The Five Laws

## Law 1

Reduce thinking.

The interface should answer questions before users ask them.

---

## Law 2

One screen.

One purpose.

No exceptions.

---

## Law 3

Motion teaches.

Never animate for decoration.

---

## Law 4

Whitespace is a feature.

Never fill empty space because it "looks empty."

---

## Law 5

Users should feel faster than they actually are.

---

# Visual Rules

Never use

❌ Heavy borders

❌ Sharp corners

❌ Dense tables

❌ Tiny buttons

❌ Pop-up overload

❌ Bright gradients

❌ Harsh shadows

---

Always use

✅ Layered depth

✅ Soft shadows

✅ Large spacing

✅ Elegant motion

✅ Glass surfaces

✅ Floating UI

---

# Layout Rules

Desktop

12-column grid

Tablet

8-column grid

Mobile

4-column grid

Maximum content width

1440px

---

# Spacing Rules

Use only spacing tokens.

Never hardcode spacing.

Base scale

```text id="ezpz4d"
4

8

12

16

24

32

40

48

56

64

80

96
```

---

# Typography Rules

Font

Geist

Never use more than

3 font weights

Maximum

75 characters per line

Avoid ALL CAPS except labels.

---

# Color Rules

Use semantic colors.

Primary

Secondary

Success

Warning

Danger

Info

Never communicate meaning using color alone.

---

# Component Rules

Every component must have

Hover

Focus

Pressed

Disabled

Loading

Error (if applicable)

Empty (if applicable)

Responsive behavior

Dark mode

Accessibility

---

# Button Rules

Minimum height

44px

Primary CTA

One per screen

Loading

Morph animation

Never disable without explanation.

---

# Input Rules

Large click target

Animated label

Inline validation

Helpful error message

Keyboard optimized

---

# Card Rules

Hover lift

Soft shadow

Border glow

Rounded corners

Consistent padding

---

# Navigation Rules

Sidebar

Persistent

Collapsible

Animated

Top Navigation

Glass

Blur

Responsive

---

# Table Rules

Avoid whenever possible.

Prefer

Cards

Timelines

Lists

Dashboards

Only use tables for

Admin

Analytics

Large datasets

---

# Dashboard Rules

Always answer

What changed?

↓

What needs attention?

↓

What should I do next?

---

# Motion Rules

Hover

150ms

Click

100ms

Transition

600ms

Dialogs

250ms

Never

Bounce

Spin

Flash

Random animations

---

# Loading Rules

Skeletons

Always

Progressive reveal

Always

Fullscreen spinner

Never

---

# Notification Rules

Floating

Stacked

Dismissible

Grouped

Non-blocking

---

# Empty State Rules

Every empty state includes

Illustration

↓

Explanation

↓

Primary Action

↓

Optional Secondary Action

---

# Error Rules

Explain

What happened

↓

Why

↓

How to fix

↓

Retry

---

# Accessibility Rules

WCAG AA

Keyboard Navigation

Focus Ring

ARIA Labels

Reduced Motion

Screen Readers

Minimum Contrast

---

# Responsive Rules

Nothing removed.

Only reorganized.

Desktop

↓

Tablet

↓

Mobile

Every feature remains available.

---

# Animation Rules

Animate

Opacity

Transform

Scale

Blur

Never animate

Width

Height

Margins

Padding

---

# Glass Rules

Use glass only on

Navigation

Dialogs

Notifications

Floating Panels

Search

Never use glass on everything.

---

# Performance Rules

60 FPS

GPU Accelerated

Lazy Load

Code Split

Image Optimization

Streaming

---

# Firestore Rules

Realtime

Only where valuable.

Avoid unnecessary listeners.

---

# Design Review Checklist

Every screen must answer

Is hierarchy obvious?

↓

Is primary action obvious?

↓

Can this be simplified?

↓

Does motion improve clarity?

↓

Is spacing consistent?

↓

Does it feel premium?

---

# Product Review Checklist

Before merging a feature

✓ Responsive

✓ Accessible

✓ Fast

✓ Beautiful

✓ Animated

✓ Firestore integrated

✓ Secure

✓ Role aware

✓ Error handling

✓ Empty states

✓ Loading states

---

# AI Development Rules

Whenever an AI agent generates code it must

* Use existing components first.
* Reuse design tokens.
* Follow Motion System.
* Follow Design System.
* Never invent new styles.
* Never duplicate components.
* Never bypass Firebase security.
* Never create inline styles unless necessary.
* Never introduce a second design language.

---

# Forbidden Patterns

❌ Bootstrap layouts

❌ Generic admin dashboards

❌ Material Design appearance

❌ Card overload

❌ Multiple primary CTAs

❌ Long forms

❌ Modal chains

❌ Hidden navigation

❌ Tiny click targets

❌ Inconsistent animations

---

# Signature EvenTech Feeling

When someone opens EvenTech for the first time they should think:

> "This feels like premium creative software."

Not

> "This feels like another business dashboard."

---

# Final Rule

Every design decision must pass one simple test:

> **Would this interaction feel at home in Linear, Luma, or Apple's own software?**

If the answer is **no**, redesign it before shipping.

EvenTech should become a benchmark for modern SaaS design—not merely another event management application.
