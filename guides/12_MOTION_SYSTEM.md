# 12_MOTION_SYSTEM.md

> **EvenTech Motion Design System**
>
> Version: 1.0

---

# Purpose

Motion is one of EvenTech's biggest competitive advantages.

The goal is **not** to have the most animations.

The goal is to make every interaction feel alive, intelligent, and premium.

The benchmark is software like:

* Luma
* Linear
* Arc Browser
* Raycast
* Stripe
* Apple
* Framer
* Vercel Dashboard

Motion should communicate.

Never decorate.

---

# Motion Philosophy

Every animation must answer one question.

**Why is this moving?**

If there is no answer...

Remove it.

---

# Motion Principles

## Clarity

Motion explains relationships.

---

## Continuity

Objects should never magically appear.

They should transition.

---

## Physics

Everything should feel like it has weight.

---

## Feedback

Every action has a response.

---

## Hierarchy

Motion directs attention.

---

# Motion Stack

Animation Library

Motion (Framer Motion)

Micro Interactions

ReactBits

Premium Components

21st.dev

GPU Animations

CSS Transform

Never animate layout using expensive properties.

---

# Animation Performance Rules

Always animate

* opacity
* transform
* scale
* rotate (small)
* blur
* clip-path (carefully)

Never animate

* width
* height
* top
* left

unless absolutely necessary.

---

# Timing Scale

```text
Instant

80ms

Fast

150ms

Default

250ms

Medium

400ms

Slow

600ms

Hero

900ms

Scene

1200ms
```

---

# Easing

Default

Spring

Secondary

easeOut

Exit

easeIn

Large transitions

Custom spring.

Never linear.

---

# Spring Presets

Soft

Cards

Medium

Buttons

Firm

Drag & Drop

Heavy

Dialogs

Elastic

Success only

---

# Motion Categories

* Navigation
* Layout
* Hover
* Focus
* Scroll
* Drag
* Loading
* Success
* Error
* Empty
* Charts
* Timeline
* Notifications
* Background

---

# Page Transitions

Every page transition includes

Fade

*

Blur

*

Shared Element

*

Layout Animation

Duration

600–700ms

---

# Shared Element Transitions

Required for

Event Card → Event Details

Organizer Card → Organizer Profile

Dashboard Card → Analytics

Image Gallery

Dialog Expansion

Ticket Card → Ticket Details

These transitions should feel seamless.

---

# Navigation Motion

Sidebar

Slide + Fade

Top Navigation

Blur on Scroll

Active Item

Animated Pill Indicator

Mobile Navigation

Slide Up

---

# Hero Animations

Landing Hero

* Gradient Mesh Animation
* Floating Orbs
* Mouse Spotlight
* Scroll Parallax (subtle)
* Text Reveal
* CTA Fade
* Live Counter Animation

Never overload.

---

# Cursor Effects

Desktop only.

Use

Mouse Spotlight

Glow

Magnetic Buttons

Soft Cursor Trail

Never replace the system cursor.

---

# Background Motion

Allowed

Animated Grid

Mesh Gradient

Aurora

Noise

Particle Drift

Light Rays

Forbidden

Fast particles

Fireworks

Constant movement

Distracting loops

---

# Card Motion

Default

Hover Lift

↓

Shadow Increase

↓

Border Glow

↓

Scale 1.02

↓

Cursor Spotlight

Duration

150ms

---

# Button Motion

Hover

Glow

↓

Scale

↓

Background Transition

Click

Compress

↓

Release

Loading

Morph into Loader

Success

Morph Back

---

# Form Motion

Focus

Border Transition

↓

Glow

↓

Label Animation

Validation

Shake

ONLY for invalid submission.

---

# Modal Motion

Open

Scale

↓

Fade

↓

Blur

Close

Reverse

Background

Glass Blur

---

# Drawer Motion

Slide

↓

Fade

↓

Content Stagger

---

# Notification Motion

Toast

Slides

↓

Fades

↓

Stacks

↓

Auto Rearranges

Never block interaction.

---

# Timeline Motion

Timeline is one of the signature experiences.

Completion

Progress Bar

↓

Milestone Fill

↓

Glow

↓

Confetti Burst (small)

↓

Activity Feed Update

↓

Analytics Counter

Everything synchronized.

---

# Kanban Motion

Drag

Lift Card

↓

Shadow

↓

Scale

↓

Rotation (1°)

↓

Drop Spring

Columns react subtly.

---

# Calendar Motion

Month Transition

Slide

↓

Fade

↓

Shared Layout

Task Creation

Expand from Day Cell

---

# Analytics Motion

Numbers

Count Up

Charts

Animate on Load

Filters

Morph

Realtime

Pulse Update

---

# Activity Feed

New activity

Slides from Top

↓

Highlight

↓

Fade to Normal

---

# Live Booking Counter

Realtime

Count Animation

Glow

Pulse

Small Sound (Future)

---

# Ticket Animation

QR

Reveal

↓

Rotate Slightly

↓

Glow Border

↓

Status Badge

---

# Receipt Upload

Upload

Progress Ring

↓

Compression

↓

Success Morph

↓

Pending Badge

---

# Loading Motion

Skeleton

Shimmer

↓

Fade

↓

Content Reveal

Never use fullscreen spinners.

---

# Empty State Motion

Illustration

Float Slowly

↓

CTA Fade

↓

Micro Interaction

---

# Error Motion

Gentle Shake

↓

Highlight

↓

Recovery CTA

No aggressive animations.

---

# Success Motion

Checkmark Draw

↓

Glow

↓

Scale

↓

Toast

↓

Realtime Update

---

# Charts

Animate

Line

Bars

Area

Pie

Avoid excessive motion.

---

# Drag & Drop

Powered by dnd-kit

Motion

Lift

↓

Rotate

↓

Shadow

↓

Snap

↓

Spring

---

# Scroll Behavior

Smooth scrolling

Section reveal

Stagger children

Sticky transitions

Parallax (very subtle)

---

# Glass Motion

Blur increases

↓

Reflection shifts

↓

Border glow

↓

Shadow changes

Very subtle.

---

# Mobile Motion

Reduce complexity.

Maintain elegance.

No heavy parallax.

Optimize for battery.

---

# Reduced Motion

Respect OS settings.

Disable

Parallax

Particles

Large transitions

Keep

Opacity

Small fades

Accessibility first.

---

# Sound Design (Future)

Optional.

Very subtle.

Booking Approved

Task Complete

Check-In Success

Notification

Can be disabled.

---

# Motion Tokens

```text
motion.fast

motion.default

motion.slow

motion.spring.soft

motion.spring.medium

motion.spring.heavy

motion.blur.small

motion.blur.medium

motion.blur.large
```

---

# Motion Acceptance Checklist

Every animation must

✓ Improve understanding

✓ Be GPU accelerated

✓ Respect reduced motion

✓ Feel smooth at 60 FPS

✓ Work on mobile

✓ Match design language

✓ Have consistent timing

✓ Never delay productivity

---

# Signature EvenTech Experiences

These interactions define the product and should receive exceptional attention.

1. Landing page hero reveal.

2. Event card → Event page transition.

3. Event creation wizard.

4. Production timeline progression.

5. Kanban drag & drop.

6. Live dashboard updates.

7. QR ticket approval sequence.

8. Organizer mini-website transitions.

9. Analytics dashboard transitions.

10. Command Palette interactions.

These experiences should make users immediately recognize EvenTech as a premium platform.

---

# Golden Rule

Motion should make the software feel **alive**, not **busy**.

Users should remember how EvenTech **felt**, not just how it looked.

Every transition should reinforce one idea:

> "I'm operating a world-class event production platform."
