# 19_MASTER_BUILD_INSTRUCTIONS.md

> **EvenTech Master Build Instructions**
>
> **This is the single source of truth for Fable, Claude Code, Cursor, Lovable, Windsurf, GitHub Copilot, or any AI software engineer working on EvenTech.**

---

# Mission

Build **EvenTech**, a world-class SaaS platform for event production and management.

The MVP targets the **music industry**, but the architecture must support future expansion into:

* Business Conferences
* Tech Events
* Festivals
* Sports
* Exhibitions
* Private Events
* Government Events

This is **not** an Eventbrite clone.

It is a **Production Operating System**.

---

# Product Identity

EvenTech should combine the best ideas from

* Luma
* Linear
* Framer
* Apple
* Arc Browser
* Stripe
* Raycast
* Notion

without copying any product.

The final identity must be unmistakably **EvenTech**.

---

# Technology Stack (Locked)

## Frontend

* Next.js 15 (App Router)
* React 19
* TypeScript
* Tailwind CSS v4
* Motion (Framer Motion)
* shadcn/ui
* 21st.dev Components
* ReactBits
* Lucide Icons

---

## Backend

Firebase

Including

* Firebase Authentication
* Firestore
* Cloud Functions Gen2
* Firebase Storage
* Firebase App Check

---

## Email

Resend

---

## Maps

Google Maps

---

## Deployment

Vercel

---

# Strict Rules

Never replace any technology without approval.

Never introduce unnecessary libraries.

Prefer existing components before creating custom ones.

---

# Design Rules

Follow

* DESIGN_SYSTEM.md
* MOTION_SYSTEM.md
* COMPONENT_LIBRARY.md
* UI_UX_RULEBOOK.md

These documents override personal preferences.

---

# Motion Rules

Every interaction should feel intentional.

Required

* Shared Element Transitions
* Animated Numbers
* Smooth Page Transitions
* Hover Physics
* Glass UI
* Timeline Animations
* Live Realtime Updates

---

# Component Rules

Priority

1. shadcn/ui

2. 21st.dev

3. ReactBits

4. Custom Component

Never build a component already available.

---

# Backend Rules

Business logic belongs inside Cloud Functions.

The frontend never makes trusted decisions.

---

# Firestore Rules

Realtime only where it adds value.

Always unsubscribe listeners.

Use indexes efficiently.

Avoid nested listeners.

---

# Authentication Rules

Use Firebase Authentication.

Supported providers

* Email
* Google

Future

* Apple
* Microsoft
* GitHub

---

# Folder Structure

```text id="xnm3f6"
app/
components/
features/
hooks/
services/
lib/
firebase/
types/
constants/
styles/
functions/
```

Never violate the project architecture.

---

# Coding Standards

Every file

* Strict TypeScript
* Named exports
* Small components
* Reusable logic
* No duplicated code

---

# Naming Conventions

Components

PascalCase

Hooks

useSomething

Functions

verbNoun

Files

kebab-case

Firestore Collections

camelCase

---

# Performance Targets

Performance

95+

Accessibility

100

SEO

100

Best Practices

100

Route transitions

<700ms

Cloud Functions

<500ms average

---

# Accessibility

Required

Keyboard Navigation

ARIA Labels

Focus Management

Reduced Motion

Screen Reader Support

WCAG AA

---

# Responsive

Desktop First

Tablet

Mobile

No missing functionality.

---

# Security

Firebase Rules

Storage Rules

Cloud Functions

Audit Logs

Role-Based Permissions

Organization Isolation

---

# Development Workflow

Every feature

Research

↓

Design

↓

Component Reuse

↓

Implementation

↓

Testing

↓

Optimization

↓

Documentation

↓

Merge

---

# Git Workflow

```text id="3qg68m"
feature/*
      ↓
Pull Request
      ↓
Review
      ↓
Develop
      ↓
Main
```

---

# Pull Request Requirements

Every PR must include

* Screenshot
* Responsive Verification
* Accessibility Verification
* Motion Verification
* Firebase Verification
* Performance Verification

---

# AI Coding Rules

Before generating code

Read all project documentation.

Never guess architecture.

Reuse existing abstractions.

Never invent design tokens.

Never create duplicate functionality.

---

# UX Philosophy

Users should always know

Where they are.

↓

What changed.

↓

What they should do next.

---

# Error Handling

Every async operation

Loading

↓

Success

↓

Failure

↓

Recovery

Never leave the user uncertain.

---

# Notifications

Floating

Animated

Grouped

Contextual

Never interrupt workflows.

---

# Event Workflow

```text id="w8kj5l"
Draft

↓

Planning

↓

Venue

↓

Artists

↓

Branding

↓

Marketing

↓

Publish

↓

Bookings

↓

QR

↓

Live Event

↓

Completed

↓

Archive
```

---

# Booking Workflow

```text id="jbwvzr"
User Books

↓

Shows Organizer IBAN

↓

Receipt Upload

↓

Pending

↓

Organizer Approval

↓

QR Generation

↓

Resend Email

↓

Dashboard Update

↓

Analytics Update
```

---

# Future Expansion

Architecture must support

* Multi-tenancy
* Subscription Plans
* Payment Gateways
* Marketplace
* AI
* CRM
* White Label
* Enterprise Features

without major refactoring.

---

# Code Quality Rules

Every feature must be

✓ Typed

✓ Responsive

✓ Accessible

✓ Animated

✓ Secure

✓ Firestore Integrated

✓ Cloud Function Ready

✓ Error Handling

✓ Loading States

✓ Empty States

✓ Reusable

---

# Things AI Must Never Do

❌ Build generic dashboards

❌ Ignore design tokens

❌ Ignore motion system

❌ Duplicate components

❌ Mix UI libraries randomly

❌ Hardcode colors

❌ Hardcode spacing

❌ Hardcode animation values

❌ Put secrets in the frontend

❌ Put business logic in React

---

# Success Definition

The project is successful when:

An organizer feels they are operating a professional production studio.

An attendee feels they are using a premium consumer platform.

A developer feels the codebase is clean, scalable, and enjoyable to work with.

---

# Final Command to Any AI Agent

Before writing a single line of code, fully understand the entire EvenTech architecture.

Every implementation must strictly follow the documentation contained in this project.

Do not improvise.

Do not simplify.

Do not replace technologies.

Do not create parallel systems.

Build one cohesive platform where design, engineering, motion, security, and user experience work together as a single product.

Your objective is not simply to build software.

Your objective is to build **the best-designed event production SaaS in the market.**
