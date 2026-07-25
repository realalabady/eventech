# 24_STATE_MANAGEMENT.md

> **EvenTech State Management Architecture**
>
> Version: MVP 1.0

---

# Purpose

This document defines how state is managed throughout the EvenTech application.

The goal is to build a predictable, scalable, and high-performance frontend while minimizing unnecessary re-renders and keeping the application easy to maintain.

---

# Core Philosophy

There is **no single global state**.

Every piece of state belongs in the smallest scope possible.

Priority:

```text
URL

↓

Server (Firestore)

↓

Local Component

↓

Global Store
```

The Firestore database is the **source of truth**.

---

# Technology Stack

State Management

* React Context
* Zustand

Server State

* Firestore Realtime Listeners

Forms

* React Hook Form
* Zod

Caching

* React cache
* Next.js App Router Cache

Animations

* Motion Values

---

# State Categories

---

# 1. Authentication State

Owner

Firebase Authentication

Contains

* Current User
* Authentication Status
* User Role
* Organization Memberships
* Session Status

Never duplicate auth state manually.

---

# 2. User State

Contains

```text
Profile

Preferences

Theme

Language

Permissions
```

Loaded after authentication.

---

# 3. Organization State

Contains

```text
Organization

Branding

Members

Roles

Settings
```

Realtime.

---

# 4. Event State

Contains

```text
Draft

Published

Timeline

Artists

Venue

Analytics
```

Realtime.

---

# 5. Booking State

Contains

```text
Bookings

Pending

Approved

Rejected
```

Realtime.

---

# 6. Ticket State

Contains

```text
QR

Status

Validation
```

Realtime during check-in.

---

# 7. Notifications

Contains

Unread

Recent

Floating Toasts

Realtime.

---

# 8. Messaging

Realtime.

Contains

Channels

Messages

Presence

Typing

---

# 9. Dashboard

Contains

Analytics

Timeline

Tasks

Calendar

Activity

Realtime.

---

# 10. Search State

Contains

Search Query

Filters

Sort

Pagination

Lives in URL whenever possible.

---

# Zustand Stores

Only create stores for application-wide UI state.

---

## ui-store

Contains

```text
Sidebar

Theme

Drawer

Command Palette

Active Modal

Toast Queue
```

---

## notification-store

Contains

Unread Count

Toast Queue

Notification Drawer

---

## player-store (Future)

Contains

Music Preview

Playback

Volume

---

## command-store

Contains

Global Search

Command Palette

Keyboard Navigation

---

# What NOT to Store Globally

Never place

Users

Events

Bookings

Tasks

Analytics

Timeline

Messages

inside Zustand.

They belong to Firestore.

---

# Firestore Listener Strategy

Good

```text
Dashboard

↓

Subscribe

↓

Leave Page

↓

Unsubscribe
```

Bad

```text
Application Start

↓

Subscribe Everything

↓

Never Cleanup
```

---

# Optimistic Updates

Use optimistic UI for

Task Movement

Kanban

Favorites

Theme Changes

Notification Read

Avatar Upload

Never use optimistic updates for

Payments

Approvals

QR Validation

Permissions

---

# Form State

Every form uses

React Hook Form

*

Zod Validation

No uncontrolled forms.

---

# Draft Strategy

Large forms

Auto Save

Every

5 seconds

or

Field Blur

---

# URL State

Use URL for

Search

Filters

Sorting

Pagination

Tabs (where shareable)

Benefits

Bookmarkable

Shareable

Browser Back Support

---

# Local Component State

Use React state for

Dropdown

Tooltip

Popover

Accordion

Input Focus

Temporary Selection

Animation Trigger

---

# Loading States

Every async state has

Idle

Loading

Success

Error

Empty

Refreshing

---

# Error State

Never use generic errors.

Always provide

What happened

↓

Why

↓

Recovery

↓

Retry

---

# Derived State

Never duplicate data.

Example

Wrong

```text
Completed Tasks Count
```

Store

Instead

Calculate

from

Tasks.

---

# Caching Strategy

Next.js Cache

↓

Firestore Cache

↓

Memory

↓

Network

---

# Revalidation

Realtime Collections

No cache.

Static Content

Long cache.

Marketing Pages

ISR.

---

# Animation State

Never store animation in Firestore.

Use Motion

Motion Values

Shared Layout

Presence

---

# Theme State

Stored

Firestore User Preferences

↓

LocalStorage

↓

Applied on Startup

---

# Permission State

Loaded after authentication.

Never trust frontend permissions.

Cloud Functions verify again.

---

# Offline Strategy (Future)

Firestore Offline Cache

↓

Sync

↓

Conflict Resolution

---

# Memory Optimization

Unmount listeners.

Virtualize long lists.

Paginate activity feeds.

Lazy load heavy dashboards.

Code split feature modules.

---

# Re-render Rules

Avoid passing large objects through props.

Prefer

Selectors

Memoization

Stable references

Small components

---

# State Ownership

```text
Authentication
      ↓
User
      ↓
Organization
      ↓
Event
      ↓
Bookings
      ↓
Tickets
      ↓
Analytics
```

Every state has a single owner.

---

# Development Rules

Never duplicate Firestore data.

Never synchronize two global stores.

Never mirror Firestore into Zustand.

Keep UI state separate from business state.

Always unsubscribe listeners.

---

# Performance Targets

Initial Render

<2s

Realtime Update

<100ms

State Update

<16ms

Navigation

<700ms

---

# Final Principle

State should always live **where it naturally belongs**.

* Business data belongs in Firestore.
* Authentication belongs to Firebase Auth.
* UI state belongs in Zustand.
* Temporary interaction state belongs in React.
* URL-shareable state belongs in the URL.

Following this architecture keeps EvenTech fast, predictable, and scalable as the platform grows into a multi-tenant production operating system.
