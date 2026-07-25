# 16_UI_SCREEN_BLUEPRINTS.md

> **EvenTech UI Screen Blueprints**
>
> Version: MVP 1.0

---

# Purpose

This document defines every major screen in EvenTech.

It serves as the blueprint for Figma, Lovable, Fable, Claude Code, Cursor, or any AI coding agent.

Every screen should be built exactly according to this structure.

---

# Design Rules

Every screen must follow:

* 12-column responsive grid
* 8pt spacing system
* Glassmorphism
* Motion System
* Design System
* Component Library
* Dark Mode
* Responsive-first
* Accessibility

---

# 1. Landing Page

```text
────────────────────────────────────────────

Glass Navbar

Hero

Animated Background

Trusted By

Features

Organizer Workflow

Live Dashboard Preview

Testimonials

Pricing (Future)

FAQ

CTA

Footer

────────────────────────────────────────────
```

---

# Hero Section

Contains

* Animated Gradient Mesh
* Floating Particles
* Headline
* Description
* CTA
* Secondary CTA
* Dashboard Preview
* Mouse Spotlight
* Live Metrics

---

# Dashboard Preview

Floating cards

* Timeline
* Analytics
* Calendar
* Kanban
* Notifications

Everything animated.

---

# 2. Discover Page

```text
Navbar

↓

Search

↓

Filters

↓

Categories

↓

Featured Events

↓

Popular Organizers

↓

Upcoming Events

↓

Footer
```

---

# Filters

Location

Genre

Date

Price

Availability

Organizer

---

# Event Grid

Responsive

Desktop

4 Columns

Tablet

2 Columns

Mobile

1 Column

---

# Event Card

Poster

↓

Title

↓

Organizer

↓

Date

↓

Venue

↓

Price

↓

Availability

↓

Hover Animation

---

# 3. Event Details

```text
Hero Cover

↓

Quick Info

↓

Booking Card

↓

Artists

↓

Venue

↓

Gallery

↓

Timeline

↓

FAQ

↓

Organizer

↓

Recommendations
```

---

# Hero

Background Poster

Gradient Overlay

Countdown

Quick Actions

Book Button

Share

Favorite

---

# Booking Panel

Price

Availability

Instructions

IBAN

Upload Receipt

Pending Status

---

# 4. Organizer Public Website

```text
Hero

↓

About

↓

Upcoming Events

↓

Past Events

↓

Gallery

↓

Reviews

↓

Social Links

↓

Contact
```

Organizer controls

Logo

Theme

Colors

Images

Cover

Typography

---

# 5. Attendee Dashboard

```text
Sidebar

↓

Header

↓

Upcoming Events

↓

QR Tickets

↓

Booking History

↓

Favorites

↓

Notifications
```

---

# Quick Actions

Browse Events

View Tickets

Edit Profile

Notifications

---

# 6. Ticket Screen

Displays

QR Code

Event

Organizer

Venue

Maps

Instructions

Emergency Contact

Add to Calendar

---

# Ticket Status

Active

Used

Cancelled

Expired

---

# 7. Organizer Dashboard

```text
Sidebar

↓

Workspace Header

↓

Current Event

↓

Timeline

↓

Kanban

↓

Calendar

↓

Analytics

↓

Recent Activity

↓

Pending Bookings
```

---

# Workspace Header

Current Event

Quick Actions

Notifications

Search

Profile

---

# Analytics Cards

Revenue

Bookings

Capacity

Tasks

Progress

Attendance

---

# 8. Event Wizard

Wizard Layout

```text
Progress

↓

Content

↓

Preview

↓

Actions
```

---

# Steps

Basic Info

Venue

Artists

Schedule

Tickets

Branding

Media

Marketing

Publish

---

# 9. Timeline

Timeline occupies the full page.

Each milestone

Card

↓

Progress

↓

Dependencies

↓

Completion

↓

History

---

# Timeline Card

Title

Status

Due Date

Owner

Dependencies

Checklist

Comments

---

# 10. Kanban

Columns

Planning

↓

Todo

↓

Doing

↓

Review

↓

Done

---

# Card

Title

Members

Priority

Checklist

Due Date

Attachments

---

# 11. Calendar

Views

Month

Week

Day

Agenda

---

# Calendar Sidebar

Upcoming Tasks

Bookings

Meetings

Deadlines

---

# 12. Booking Management

Organizer View

Pending

Approved

Rejected

Cancelled

---

# Booking Card

Attendee

Receipt

Transfer

Approve

Reject

View History

---

# 13. Team Workspace

Sections

Members

Permissions

Roles

Presence

Messages

Activity

---

# Team Member Card

Avatar

Role

Status

Assigned Tasks

Last Active

---

# 14. Messaging

Layout

```text
Channels

↓

Conversation

↓

Details
```

---

# Message

Avatar

Message

Attachments

Timestamp

Reactions (Future)

---

# 15. QR Scanner

Full Screen Camera

↓

Live Validation

↓

Ticket Result

↓

Check-in

↓

Realtime Attendance

---

# Validation States

Green

Valid

Red

Used

Orange

Pending

Gray

Cancelled

---

# 16. Analytics

Overview

↓

Revenue

↓

Attendance

↓

Bookings

↓

Timeline Progress

↓

Conversion

↓

Traffic

---

# Charts

Area

Line

Bar

Pie

Heatmap

Realtime Counter

---

# 17. Branding Studio

Sections

Logo

Colors

Typography

Gallery

Cover

Preview

---

# Live Preview

Desktop

Tablet

Mobile

Realtime updates.

---

# 18. Notifications

Floating Panel

Grouped

Realtime

Animated

---

# Notification Card

Icon

Title

Message

Time

Action

---

# 19. User Settings

Tabs

Account

Appearance

Notifications

Security

Preferences

Connected Accounts (Future)

---

# 20. Super Admin

Sidebar

↓

Platform Overview

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

Feature Flags

↓

System Health

---

# Platform Metrics

Daily Users

Bookings

Revenue

Events

Errors

Response Time

Cloud Functions

---

# Mobile Layout Rules

Navigation

Bottom Bar

Workspace

Drawer

Actions

Floating Button

Tables

Become Cards

Sidebar

Becomes Drawer

---

# Loading Screens

Every major page

Skeleton

Progressive Reveal

No blank screens.

---

# Empty Screens

Illustration

↓

Title

↓

Description

↓

Primary CTA

---

# Error Screens

Friendly Copy

Retry Button

Support Link

Diagnostic Code

---

# Success Screens

Animated Checkmark

Summary

Next Action

---

# Screen Quality Checklist

Every screen must satisfy

✓ Responsive

✓ Accessible

✓ Animated

✓ Glass Design

✓ Reusable Components

✓ Premium Layout

✓ Dark Mode

✓ Light Mode

✓ Fast Rendering

✓ Firestore Realtime

---

# Signature Screens

The following screens define the identity of EvenTech and should receive the highest level of design attention:

1. Landing Page
2. Organizer Workspace
3. Event Creation Wizard
4. Production Timeline
5. Kanban Board
6. Analytics Dashboard
7. QR Ticket Screen
8. Organizer Mini Website
9. Discover Events
10. Event Details

These screens should be portfolio-quality and distinguish EvenTech from every generic event management platform.

---

# Final Rule

Every screen should answer one question immediately:

> **"What is the next most important thing the user should do?"**

The interface should never make users think about navigation—they should naturally flow from one action to the next.
