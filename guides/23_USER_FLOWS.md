# 23_USER_FLOWS.md

> **EvenTech Complete User Flow Specification**
>
> Version: MVP 1.0

---

# Purpose

This document defines every user journey inside EvenTech.

Every screen should naturally lead to the next.

There should never be a dead end.

---

# Flow Philosophy

Good software guides.

Great software anticipates.

Every flow should answer

> What should happen next?

without the user needing to think.

---

# User Types

Guest

↓

Attendee

↓

Organizer

↓

Staff

↓

Scanner

↓

Super Admin

---

# Guest Flow

```text id="n8gfpk"
Landing

↓

Discover Events

↓

View Event

↓

View Organizer

↓

Register

↓

Become Attendee
```

---

# Authentication Flow

```text id="g8mwkt"
Register

↓

Email Verification

↓

Profile Creation

↓

Choose Role

↓

Onboarding

↓

Dashboard
```

---

# Attendee Journey

```text id="a4rf0i"
Landing

↓

Discover

↓

Search

↓

Event Details

↓

Book Event

↓

Transfer Payment

↓

Upload Receipt

↓

Pending Approval

↓

Booking Approved

↓

QR Ticket Email

↓

Ticket Dashboard

↓

Attend Event

↓

QR Scan

↓

Event History

↓

Leave Review
```

---

# Discover Flow

```text id="m3h4v0"
Discover

↓

Search

↓

Filters

↓

Categories

↓

Organizer

↓

Event Details

↓

Book
```

---

# Booking Flow

```text id="wk3k4n"
Select Event

↓

Book

↓

Display Organizer IBAN

↓

Bank Transfer

↓

Upload Receipt

↓

Pending

↓

Organizer Review

↓

Approved

↓

Cloud Function

↓

Generate QR

↓

Resend Email

↓

Ticket Dashboard
```

---

# Organizer Journey

```text id="1m0ksz"
Register

↓

Create Organization

↓

Brand Organization

↓

Invite Team

↓

Create Event

↓

Timeline

↓

Kanban

↓

Calendar

↓

Publish

↓

Receive Bookings

↓

Approve Tickets

↓

Run Event

↓

Analytics

↓

Archive
```

---

# Organization Creation

```text id="lt2jl0"
Create Organization

↓

Upload Logo

↓

Upload Cover

↓

Theme

↓

IBAN

↓

Social Links

↓

Workspace Ready
```

---

# Event Creation Wizard

```text id="fhd9s7"
Basic Information

↓

Venue

↓

Artists

↓

Schedule

↓

Tickets

↓

Branding

↓

Gallery

↓

Marketing

↓

Review

↓

Publish
```

Every step

Auto Saves.

---

# Timeline Flow

```text id="j0brlu"
Planning

↓

Venue

↓

Artists

↓

Production

↓

Marketing

↓

Published

↓

Live

↓

Completed

↓

Archived
```

Timeline progress updates

Analytics

Notifications

Activity Feed

Realtime Dashboard

---

# Kanban Flow

```text id="fjvn2v"
Planning

↓

Todo

↓

Doing

↓

Review

↓

Done
```

Card completion

↓

Timeline Update

↓

Activity Feed

↓

Analytics

---

# Calendar Flow

```text id="ifb2wc"
Create Task

↓

Assign Date

↓

Calendar

↓

Reminder

↓

Complete

↓

Timeline Update
```

---

# Team Flow

```text id="v09g8i"
Invite Member

↓

Email

↓

Accept Invitation

↓

Choose Role

↓

Workspace Access

↓

Realtime Collaboration
```

---

# Task Flow

```text id="a0ezsx"
Create Task

↓

Assign

↓

Notification

↓

Start

↓

Progress

↓

Review

↓

Done

↓

Timeline Updated
```

---

# Booking Approval Flow

```text id="0d9m9t"
Pending Queue

↓

View Receipt

↓

Approve

↓

Cloud Function

↓

Generate Ticket

↓

Generate QR

↓

Email

↓

Analytics

↓

Notification
```

---

# Rejection Flow

```text id="ytzy0x"
Pending

↓

Reject

↓

Reason

↓

Notification

↓

User Dashboard
```

---

# QR Flow

```text id="25e8bw"
QR Generated

↓

Email

↓

Wallet (Future)

↓

Ticket Dashboard

↓

Scanner

↓

Validation

↓

Attendance Updated
```

---

# Scanner Flow

```text id="lc7u4w"
Camera

↓

Scan

↓

Cloud Validation

↓

Green

↓

Check In

↓

Attendance Counter

↓

Dashboard Update
```

---

# Organizer Branding Flow

```text id="h3m4cx"
Logo

↓

Colors

↓

Typography

↓

Gallery

↓

Preview

↓

Publish
```

Changes appear

Instantly

Across organizer pages.

---

# Messaging Flow

```text id="rtl0mo"
Open Channel

↓

Read Messages

↓

Reply

↓

Mention

↓

Notification

↓

Realtime Update
```

---

# Notification Flow

```text id="xdk7xw"
System Event

↓

Cloud Function

↓

Notification

↓

Floating Toast

↓

Notification Center

↓

Email (If Needed)
```

---

# Analytics Flow

```text id="uxe9nh"
Booking

↓

Firestore

↓

Analytics Update

↓

Dashboard

↓

Charts

↓

Reports
```

Realtime.

---

# Review Flow

```text id="e8c38f"
Completed Event

↓

Leave Rating

↓

Comment

↓

Organizer Page
```

---

# Super Admin Flow

```text id="g8ukpm"
Login

↓

Platform Dashboard

↓

Users

↓

Organizations

↓

Events

↓

Reports

↓

Audit Logs

↓

Moderation
```

---

# Error Recovery Flow

```text id="mjtsvn"
Error

↓

Friendly Explanation

↓

Retry

↓

Alternative Action

↓

Support
```

---

# Empty State Flow

```text id="dkc4ll"
Illustration

↓

Explanation

↓

Primary CTA

↓

Guide User
```

---

# Mobile Flow

Bottom Navigation

↓

Quick Actions

↓

Drawer

↓

Task Completion

↓

Realtime Updates

---

# AI Future Flow

```text id="i1v6lz"
Organizer

↓

Ask AI

↓

Analyze Workspace

↓

Recommendations

↓

One Click Execution
```

---

# Cross-System Automation

When an organizer approves a booking:

```text id="v1ovvq"
Booking

↓

Ticket Created

↓

QR Generated

↓

Analytics Updated

↓

Notification Created

↓

Email Sent

↓

Activity Feed Updated

↓

Dashboard Updated
```

One action.

Multiple automated systems.

---

# Flow Quality Checklist

Every flow must

✓ Be linear

✓ Be recoverable

✓ Handle errors

✓ Show loading

✓ Show success

✓ Update analytics

✓ Trigger notifications

✓ Respect permissions

✓ Work on mobile

---

# UX Principles

Users should never ask

"Where do I go next?"

Every important action should naturally lead to the next logical step.

The product should guide users through complex event management without overwhelming them.

---

# Final Principle

EvenTech is a workflow platform.

The value is not individual features.

The value is how seamlessly every feature connects to the next.

Every user journey should feel like one continuous experience from start to finish.
