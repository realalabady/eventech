# 39_EVENT_CREATION_WORKFLOW.md

> **EvenTech Event Production Workflow System**
>
> Version: MVP 1.0

---

# Purpose

Define the complete organizer workflow from idea to completed event.

EvenTech should guide hosts through professional event production.

---

# Event Lifecycle

```text
Idea

↓

Planning

↓

Preparation

↓

Announcement

↓

Booking

↓

Execution

↓

Completion

↓

Analytics
```

---

# Event Creation Philosophy

Creating an event should feel like producing a professional project.

Not filling a form.

---

# Creation Wizard

Multi-step workflow:

```text
Step 1

Event Identity


↓

Step 2

Venue


↓

Step 3

Schedule


↓

Step 4

Branding


↓

Step 5

Team


↓

Step 6

Tasks


↓

Step 7

Payment Setup


↓

Step 8

Publish Review
```

---

# Step 1 — Event Identity

Fields:

```text
Event Name

Description

Category

Cover Image

Event Type
```

Categories:

```text
Industrial Music

Festival

Concert

Private Event
```

---

# Step 2 — Venue

Organizer adds:

```text
Venue Name

Address

Google Maps Location

Capacity

Images
```

System creates:

```text
events/{eventId}/venue
```

---

# Step 3 — Schedule

Required:

```text
Start Date

End Date

Opening Time

Closing Time
```

Calendar automatically creates timeline milestones.

---

# Step 4 — Branding

Organizer customizes:

```text
Primary Color

Secondary Color

Cover Image

Logo

Gallery
```

This controls the public event page.

---

# Step 5 — Team Setup

Organizer invites:

```text
Managers

Designers

Security

Finance

Staff
```

Each role receives permissions.

---

# Step 6 — Task Planning

System generates default tasks:

Example:

```text
Confirm Venue

Design Poster

Contact Artists

Setup Security

Prepare Entrance

Test Equipment
```

Organizer can modify.

---

# Step 7 — Payment Setup

MVP:

IBAN Transfer

Required:

```text
Bank Name

IBAN

Account Holder
```

Stored securely.

---

# Step 8 — Review

Before publishing:

Checklist:

✓ Event information

✓ Venue

✓ Schedule

✓ Branding

✓ Payment

✓ Team

---

# Event Status

```typescript
draft

planning

published

live

completed

cancelled
```

---

# Timeline Generation

When event is created:

Cloud Function creates:

```text
timeline milestones
```

Example:

```text
Venue Confirmed

Marketing Started

Tickets Open

Event Day

After Event Report
```

---

# Public Event Page

Generated automatically.

Contains:

```text
Hero Image

Event Details

Venue

Organizer

Gallery

Booking Button

Share Actions
```

---

# Event Editing

Changes update:

* Public page
* Dashboard
* Notifications
* Calendar

---

# Event Publishing

Flow:

```text
Draft

↓

Review

↓

Publish

↓

Public Visibility
```

Cloud Function:

* Generates SEO metadata
* Creates activity log
* Sends notification

---

# Collaboration

Team members can:

* View timeline
* Complete tasks
* Comment
* Upload files

---

# Event Completion

After event:

Organizer receives:

* Attendance report
* Booking analytics
* Activity summary

---

# Final Principle

An event is a living workflow.

EvenTech should guide organizers from the first idea until the final analysis, making complex production feel simple.
