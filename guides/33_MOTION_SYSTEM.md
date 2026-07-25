# 33_MOTION_SYSTEM.md

> **EvenTech Motion System**
>
> **The Complete Animation & Interaction Specification**
>
> Version: 1.0

---

# Mission

Motion is one of EvenTech's biggest competitive advantages.

It should make the application feel alive, intelligent, and premium.

Users should notice the product feels incredible.

They should **not** notice the animations themselves.

---

# Motion Philosophy

Every animation must answer at least one question:

* What changed?
* Where did it go?
* Where did it come from?
* What should I focus on?
* Is the system working?

If an animation cannot answer one of these questions,

it should not exist.

---

# Design Inspirations

Primary Inspiration

* Luma
* Linear
* Framer
* Apple VisionOS
* Arc Browser

Secondary Inspiration

* Raycast
* Figma
* Vercel

Never imitate.

Understand the principles.

---

# Motion Stack

Use only

* Motion (`motion/react`)
* ReactBits animations
* 21st.dev motion components

Never introduce GSAP, Anime.js, or CSS animation libraries unless there is a technical requirement that Motion cannot satisfy.

---

# Animation Principles

Animations should be

✓ Smooth

✓ Fast

✓ Intentional

✓ Consistent

✓ Interruptible

✓ Accessible

Never

❌ Flash

❌ Bounce excessively

❌ Overshoot dramatically

❌ Rotate for decoration

❌ Delay user interaction

---

# Timing Tokens

## Instant

```text id="t0xgkq"
75ms
```

Hover feedback

---

## Fast

```text id="m8sqzw"
150ms
```

Buttons

Inputs

Cards

---

## Medium

```text id="d4k1bn"
250ms
```

Dialogs

Drawers

Dropdowns

---

## Standard

```text id="e0lqna"
350ms
```

Page transitions

Large cards

Shared layouts

---

## Slow

```text id="v6h1yr"
500ms
```

Hero animations

Major workflow transitions

Never exceed

```text id="i5cb8g"
700ms
```

---

# Easing

Use only

```text id="ztpn8i"
easeOut

easeInOut

spring
```

No custom cubic-bezier values unless defined in the design tokens.

---

# Shared Element Transitions

Required for

* Event Card → Event Page
* Organizer Card → Organizer Profile
* Ticket Card → Ticket Details
* Artist Card → Artist Details
* Analytics Card Expansion
* Image Gallery

---

# Page Transitions

Every page transition

1. Fade content
2. Slight scale (0.98 → 1)
3. Blur reduction
4. Shared elements animate first

Navigation should feel continuous.

---

# Hero Animations

Landing page hero should

* Fade
* Stagger content
* Reveal gradients
* Animate background softly

No looping gimmicks.

---

# Card Animations

Hover

* Lift 4–8px
* Increase shadow
* Border glow
* Slight scale (1.01–1.02)

Click

Compress slightly.

Release

Return with spring.

---

# Button Animations

Hover

* Brightness increase
* Slight elevation

Loading

* Morph into spinner
* Preserve width

Success

* Checkmark morph

---

# Form Animations

Inputs

Animated focus ring

Labels

Smooth transitions

Validation

Shake only for severe errors

Success

Gentle confirmation

---

# Modal Animations

Open

Scale

↓

Fade

↓

Backdrop Blur

Close

Reverse

Never instantly appear.

---

# Drawer Animations

Desktop

Slide + Fade

Mobile

Bottom Sheet + Spring

---

# Notification System

Floating Toasts

Enter

Slide Up

Fade

Exit

Fade

Collapse

Grouped notifications animate together.

---

# Timeline Motion

Milestones animate

Locked

↓

Active

↓

Completed

Progress bar fills continuously.

---

# Kanban Motion

Dragging

Physics-based.

Columns highlight on hover.

Drop

Spring settle.

No abrupt snapping.

---

# Calendar Motion

Switching views

Crossfade.

Event creation

Scale in.

Dragging

Smooth position interpolation.

---

# Booking Flow Motion

Booking Created

↓

Pending Badge

↓

Approval Animation

↓

QR Ticket Reveal

The user should feel progression.

---

# QR Ticket Animation

Ticket appears

↓

Glow

↓

QR fades in

↓

Instruction card slides up

A reward moment.

---

# Dashboard Animations

Cards

Stagger on first load.

Metrics

Count upward once.

Charts

Animate once.

Realtime updates

Subtle highlight.

---

# Search Experience

Command Palette

Scale

↓

Fade

↓

Blur

Results

Stagger reveal.

---

# Sidebar

Collapse

Width animation.

Icons remain stable.

Labels fade.

---

# Loading

Never show blank pages.

Skeletons should animate with shimmer.

Avoid centered spinners.

---

# Empty States

Illustration

↓

Fade

↓

Text

↓

CTA

↓

Idle animation (very subtle)

---

# Background Motion

Allowed

* Slow gradient movement
* Floating light
* Mesh gradient
* Aurora effects

Not allowed

* Fast particle systems
* Continuous distractions

---

# Charts

Animate only once.

Realtime updates

Smooth interpolation.

Never restart the chart animation.

---

# Accessibility

Respect

prefers-reduced-motion

When enabled

* Remove movement
* Keep fades
* Preserve clarity

Accessibility always wins.

---

# Performance Rules

Animations must remain at

60 FPS

Use

* transform
* opacity
* filter (sparingly)

Avoid animating

* width
* height
* top
* left

unless necessary.

---

# Motion Tokens

Centralize

```text id="s5dr4t"
Duration

Delay

Spring

Scale

Opacity

Blur
```

Never hardcode values.

---

# Anti-Patterns

Never

❌ Animate every element

❌ Add delays before interaction

❌ Use decorative spinning icons

❌ Create "cool" animations without purpose

❌ Stack multiple competing animations

❌ Block user input during transitions

---

# Quality Checklist

Every animation should be

✓ Smooth

✓ Purposeful

✓ Interruptible

✓ Responsive

✓ Accessible

✓ GPU accelerated

✓ Consistent with the motion system

---

# Final Principle

Motion is not decoration.

Motion is communication.

The best animation is the one users don't consciously notice—but that makes every interaction feel natural, responsive, and alive.

That is the EvenTech motion standard.
