# 27_DESIGN_SYSTEM.md

> **EvenTech Design System**
>
> Version: MVP 1.0

---

# Purpose

The Design System is the visual language of EvenTech.

It defines every design token, spacing rule, typography rule, color system, radius, shadows, icons, animations, and layout principle.

Nothing in the UI should be designed outside this system.

---

# Design Philosophy

EvenTech should feel like a hybrid of

* Luma
* Linear
* Framer
* Apple
* Arc Browser
* Notion

without looking like a clone of any of them.

Three words define the product:

* Elegant
* Professional
* Effortless

---

# Visual Personality

EvenTech should feel

✓ Premium

✓ Spacious

✓ Modern

✓ Calm

✓ Fast

✓ Intelligent

Never

❌ Corporate

❌ Generic

❌ Bootstrap

❌ Material Design

❌ Template-like

---

# Design Tokens

All styling must use design tokens.

Never hardcode values.

---

# Color System

## Brand

```text id="b0j6pi"
Primary

Secondary

Accent

Neutral

Surface

Background
```

---

## Semantic Colors

```text id="p9gr9w"
Success

Warning

Danger

Info
```

---

## Elevation Colors

```text id="xwaz8u"
Surface 1

Surface 2

Surface 3

Surface Hover

Glass
```

---

# Dark Mode

Dark mode is the default experience.

Light mode is fully supported.

Both themes must feel equally polished.

---

# Typography

Primary Font

**Geist**

Fallback

```text id="lfhwt5"
system-ui

sans-serif
```

---

# Font Scale

```text id="6k5v5i"
Display XL

Display L

Heading XL

Heading L

Heading M

Body L

Body M

Body S

Caption
```

Maximum

3 font weights

Recommended

* Regular
* Medium
* SemiBold

---

# Spacing Scale

Only these spacing values are allowed.

```text id="m5bnjc"
4

8

12

16

20

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

# Border Radius

```text id="61l5uh"
Small

Medium

Large

XL

2XL

Full
```

Cards should use

Large

Buttons

Medium

Floating UI

XL

---

# Shadows

Levels

```text id="v3khnd"
None

Soft

Medium

Large

Floating
```

Never use harsh shadows.

Prefer layered depth.

---

# Glassmorphism

Allowed on

* Navigation
* Floating Panels
* Search
* Notifications
* Command Palette
* Dialogs

Not allowed on

* Entire pages
* Every card
* Forms
* Tables

Glass is an accent, not the design.

---

# Grid System

Desktop

12 Columns

Tablet

8 Columns

Mobile

4 Columns

Maximum Width

1440px

---

# Containers

```text id="2t6t5g"
XS

SM

MD

LG

XL

2XL
```

Use consistent container widths across the application.

---

# Icons

Library

Lucide

Rules

* 20px default
* 16px inline
* 24px navigation
* 32px hero

Never mix icon libraries.

---

# Buttons

Variants

* Primary
* Secondary
* Outline
* Ghost
* Destructive

States

* Default
* Hover
* Active
* Focus
* Disabled
* Loading

Only one primary button per major section.

---

# Inputs

Shared style

Large height

Rounded corners

Animated focus

Inline validation

Clear labels

Never rely on placeholders as labels.

---

# Cards

Structure

```text id="yq1gk6"
Header

↓

Body

↓

Footer
```

Interactive cards

Hover Lift

Glow

Scale (subtle)

---

# Badges

Variants

* Success
* Warning
* Error
* Neutral
* Featured
* Live

---

# Status Indicators

Use semantic colors.

Include icons when appropriate.

Never rely on color alone.

---

# Motion Tokens

Animation Duration

```text id="jlwmxj"
100ms

150ms

250ms

400ms

600ms
```

Easing

* Standard
* Accelerate
* Decelerate

Use Motion library consistently.

---

# Blur Tokens

```text id="g31k4m"
Small

Medium

Large
```

Applied only where necessary.

---

# Z-Index Layers

```text id="x5g1y9"
Base

Dropdown

Sticky

Overlay

Dialog

Toast

Tooltip
```

Never use arbitrary z-index values.

---

# Layout Principles

Every page should have

* Clear hierarchy
* Obvious primary action
* Generous whitespace
* Predictable navigation

---

# Responsive Rules

Desktop

↓

Tablet

↓

Mobile

Nothing disappears.

Everything adapts.

---

# Accessibility

Minimum touch target

44px

Minimum contrast

WCAG AA

Keyboard navigation required.

Reduced motion supported.

---

# Illustration Style

Soft

Minimal

Abstract

Gradient accents

Avoid cartoon illustrations.

---

# Charts

Use

* Area
* Line
* Bar
* Pie
* Heatmap

Keep them clean.

Avoid excessive grid lines.

---

# Empty States

Every empty state includes

Illustration

↓

Message

↓

Primary Action

---

# Error States

Always explain

* What happened
* Why
* How to recover

Include Retry when possible.

---

# Loading States

Skeletons only.

Never use blocking spinners for page loads.

---

# Responsive Typography

Typography scales smoothly across breakpoints.

Avoid drastic jumps in font size.

---

# Image Guidelines

Use

* WebP when possible
* Optimized responsive images
* Lazy loading

Hero images should preserve quality without affecting performance.

---

# Design Review Checklist

Every new screen must satisfy

✓ Uses design tokens

✓ Uses approved spacing

✓ Uses approved typography

✓ Uses approved motion

✓ Uses approved components

✓ Responsive

✓ Accessible

✓ Dark Mode

✓ Light Mode

✓ Premium visual quality

---

# Anti-Patterns

Never

❌ Use random colors

❌ Invent spacing values

❌ Mix fonts

❌ Mix icon sets

❌ Use inconsistent border radii

❌ Copy UI from other SaaS products

❌ Add visual effects without purpose

---

# Brand Identity Rule

If a screenshot of EvenTech is shown without the logo,

the design language alone should be recognizable.

Consistency is a stronger brand asset than decoration.

---

# Final Principle

The Design System is not a suggestion.

It is the contract between design and engineering.

Every pixel, animation, and interaction should reinforce the feeling that EvenTech is a premium creative production platform rather than a conventional business application.
