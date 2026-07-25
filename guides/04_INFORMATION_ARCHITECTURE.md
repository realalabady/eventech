# 04_INFORMATION_ARCHITECTURE.md

> **EvenTech Information Architecture**
>
> Version: 1.0

---

# Purpose

This document defines the complete structure of the EvenTech platform.

Every page, route, navigation item, dashboard, module, and workflow must follow this architecture.

The architecture is designed for scalability and future expansion.

---

# Platform Structure

```text
EvenTech
│
├── Public Platform
├── Authentication
├── Attendee Platform
├── Organizer Workspace
└── Super Admin Platform
```

---

# Public Platform

Accessible without authentication.

```text
/

Landing

/discover

/events

/events/[slug]

/organizers

/organizers/[slug]

/artists

/artists/[slug]

/venues

/search

/pricing

/about

/contact

/blog

/privacy

/terms

/help

/faq
```

---

# Authentication

```text
/auth

/login

/register

/forgot-password

/reset-password

/verify-email

/onboarding

/select-role
```

---

# User Roles

```text
Guest

↓

Attendee

↓

Organizer

↓

Staff

↓

Super Admin
```

---

# Attendee Platform

```text
/dashboard

/dashboard/home

/dashboard/tickets

/dashboard/bookings

/dashboard/favorites

/dashboard/following

/dashboard/history

/dashboard/notifications

/dashboard/profile

/dashboard/settings
```

---

# Organizer Workspace

```text
/workspace

/workspace/dashboard

/workspace/events

/workspace/calendar

/workspace/timeline

/workspace/kanban

/workspace/bookings

/workspace/check-in

/workspace/team

/workspace/messages

/workspace/tasks

/workspace/analytics

/workspace/media

/workspace/branding

/workspace/profile

/workspace/settings
```

---

# Super Admin

```text
/admin

/admin/dashboard

/admin/users

/admin/organizers

/admin/events

/admin/artists

/admin/venues

/admin/reports

/admin/moderation

/admin/support

/admin/notifications

/admin/cms

/admin/feature-flags

/admin/system

/admin/logs

/admin/settings
```

---

# Event Architecture

Every event contains its own workspace.

```text
/workspace/events/[eventId]

Overview

Timeline

Kanban

Calendar

Bookings

Attendees

Tickets

Media

Marketing

Artists

Venue

Finance

Files

Activity

Settings
```

---

# Event Workflow

```text
Idea

↓

Planning

↓

Venue

↓

Artists

↓

Production

↓

Tickets

↓

Marketing

↓

Published

↓

Selling

↓

Live

↓

Finished

↓

Archived
```

Each stage unlocks additional tools.

---

# Navigation System

## Public Navigation

Logo

Discover

Organizers

Artists

Venues

About

Search

Login

Register

---

## Attendee Navigation

Home

Tickets

Bookings

Favorites

Notifications

Profile

---

## Organizer Sidebar

Dashboard

Events

Timeline

Kanban

Calendar

Bookings

Check-In

Tasks

Team

Messages

Media

Branding

Analytics

Settings

---

## Super Admin Sidebar

Dashboard

Users

Organizers

Events

Venues

Artists

Reports

Moderation

Support

CMS

System

Settings

---

# Event Creation Wizard

The organizer never fills one large form.

Instead, the process is divided into steps.

```text
Step 1

Basic Information

↓

Step 2

Venue

↓

Step 3

Schedule

↓

Step 4

Artists

↓

Step 5

Tickets

↓

Step 6

Branding

↓

Step 7

Media

↓

Step 8

Marketing

↓

Step 9

Review

↓

Publish
```

---

# Organizer Public Website

Each organizer owns a customizable website.

```text
Hero

↓

About

↓

Upcoming Events

↓

Featured Artists

↓

Gallery

↓

Videos

↓

Past Events

↓

Reviews

↓

FAQ

↓

Contact
```

---

# Attendee Journey

```text
Landing

↓

Discover

↓

Event Details

↓

Book Ticket

↓

Transfer Money

↓

Upload Receipt

↓

Pending Approval

↓

Receive QR

↓

Attend Event

↓

Leave Review
```

---

# Organizer Journey

```text
Register

↓

Complete Profile

↓

Customize Website

↓

Create Event

↓

Invite Staff

↓

Assign Tasks

↓

Launch Marketing

↓

Approve Bookings

↓

Manage Event

↓

Analyze Results
```

---

# Staff Journey

```text
Receive Invitation

↓

Accept

↓

Access Workspace

↓

View Assigned Tasks

↓

Complete Tasks

↓

Update Timeline

↓

Support Event

↓

Check-in Guests

↓

Close Event
```

---

# Super Admin Journey

```text
Monitor Platform

↓

Review Reports

↓

Moderate Content

↓

Manage Organizations

↓

Resolve Support

↓

Review Analytics

↓

Manage Platform
```

---

# Global Search

The search system must index

Events

Organizers

Artists

Venues

Tasks

Bookings

Users (Admin)

Staff

Files

Messages

Settings

---

# Command Palette

Shortcut

```text
Ctrl + K
```

Available actions

Navigate

Create Event

Create Task

Invite Staff

Search Event

Search User

Approve Booking

Open Calendar

Open Timeline

Open Analytics

Settings

---

# Notification Center

Categories

Bookings

Tasks

Timeline

Marketing

Team

Messages

Payments

System

Announcements

Realtime

---

# Dashboard Layout

```text
Sidebar

↓

Header

↓

Workspace

↓

Inspector Panel (optional)

↓

Floating Notifications
```

---

# Dashboard Widgets

Timeline

Kanban

Calendar

Analytics

Recent Activity

Pending Bookings

Upcoming Tasks

Quick Actions

Weather (future)

AI Assistant (future)

---

# Timeline Module

Displays

Current Stage

Completed Stages

Upcoming Stages

Progress

Dependencies

Milestones

Realtime updates

---

# Kanban Module

Columns

To Do

In Progress

Review

Blocked

Completed

Supports

Drag

Drop

Realtime Sync

Comments

Files

Labels

Members

Priority

Deadlines

---

# Calendar Module

Displays

Tasks

Bookings

Deadlines

Meetings

Artist Schedule

Venue Schedule

Supports

Day

Week

Month

Agenda

---

# Booking Module

States

Pending

Approved

Rejected

Cancelled

Checked-In

No-Show

---

# QR Check-in

Scanner Interface

QR Validation

Duplicate Detection

Offline Cache (Future)

Realtime Sync

Attendance Counter

---

# Analytics Module

Overview

Revenue

Attendance

Bookings

Check-ins

Conversion

Traffic

Organizer Growth

Realtime metrics

---

# Messaging Module

Direct Messages

Team Channels

Event Channels

Mentions

Attachments

Activity History

---

# Branding Module

Logo

Hero Image

Cover Video

Color Theme

Typography

Social Links

SEO

Domain (Future)

---

# Media Module

Images

Videos

Posters

Documents

Contracts

Receipts

Brand Assets

---

# Settings Module

Organization

Profile

Security

Members

Roles

Notifications

Billing (Future)

API Keys (Future)

Integrations (Future)

---

# Future Modules

AI Assistant

CRM

Sponsors

Vendors

Inventory

Equipment

Contracts

Budgets

Travel

Accommodation

Merchandise

Marketplace

---

# Architecture Rules

Every feature must belong to one module.

Every module must own its data.

Every page must have one primary purpose.

Navigation depth should not exceed three levels.

Users should always know:

* Where they are.
* What they can do.
* What happens next.

The information architecture must remain stable as the platform grows, ensuring EvenTech scales without becoming complex or inconsistent.
