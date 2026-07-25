# 00_MASTER_SPECIFICATION.md

> **EvenTech — Master Product Specification (MPS)**
>
> Version: 1.0
>
> Status: Foundation
>
> This document is the constitution of the EvenTech platform. Every engineer, AI coding assistant, designer, and contributor must follow this specification. If an implementation conflicts with this document, this document takes precedence.

---

# 1. Product Vision

EvenTech is a modern SaaS platform that enables event organizers to manage the complete lifecycle of an event.

The MVP focuses on the music industry while the architecture is designed to support future industries such as business conferences, sports, universities, exhibitions, government events, and festivals.

EvenTech is **not** a ticketing platform.

It is an **Operating System for Event Production**.

---

# 2. Core Philosophy

The software must feel like a premium production studio rather than an admin dashboard.

Design principles:

* Premium
* Minimal
* Fast
* Calm
* Intelligent
* Consistent
* Motion with purpose
* Accessibility first
* Mobile-first
* Responsive
* Reusable

Every feature must improve the organizer's ability to produce successful events.

---

# 3. Product Goals

### MVP Goals

* Allow organizers to create music events
* Allow attendees to discover events
* Manual booking approval
* QR ticket generation
* Team collaboration
* Event workflow
* Task management
* Organizer profile website
* Analytics dashboard

### Long-Term Goals

* White label organizations
* AI assistant
* Payment gateways
* CRM
* Sponsorship management
* Vendor management
* Enterprise features
* Subscription billing
* Multi-country deployment

---

# 4. Primary User Types

## 4.1 Attendee

Responsibilities

* Browse events
* Book tickets
* Upload transfer receipt
* Receive QR ticket
* Manage bookings
* Follow organizers
* Save favorite events
* View booking history

---

## 4.2 Organizer

Responsibilities

* Create events
* Manage events
* Invite staff
* Assign tasks
* Manage branding
* Approve bookings
* Scan attendees
* View analytics
* Publish organizer website

---

## 4.3 Staff

Permissions determined by organizer.

Possible roles

* Manager
* Marketing
* Finance
* Scanner
* Operations

---

## 4.4 Super Admin

Responsibilities

* Platform moderation
* Analytics
* User management
* Organizer management
* Event moderation
* CMS
* Feature flags
* Support
* Reports

---

# 5. Product Modules

The platform is divided into the following systems.

## Public Platform

* Landing page
* Search
* Categories
* Discover
* Event details
* Organizer profile
* Authentication

---

## User Platform

* Dashboard
* Tickets
* Bookings
* Favorites
* Notifications
* Profile
* Settings

---

## Organizer Workspace

* Dashboard
* Events
* Timeline
* Kanban
* Calendar
* Bookings
* Team
* Tasks
* Analytics
* Branding
* Media
* Organizer Website
* Notifications
* Settings

---

## Super Admin

* Dashboard
* Organizations
* Events
* Users
* Reports
* CMS
* Feature Flags
* System Monitoring
* Analytics

---

# 6. Event Lifecycle

Every event follows the same lifecycle.

```text
Idea

↓

Planning

↓

Venue Confirmed

↓

Artist Confirmed

↓

Tickets Ready

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

Every stage unlocks additional functionality.

Progress must be animated.

---

# 7. Booking Workflow

```text
User

↓

Select Event

↓

Select Ticket

↓

Display Organizer IBAN

↓

Transfer Money

↓

Upload Receipt

↓

Booking Request Created

↓

Pending Review

↓

Organizer Approval

↓

Firebase Cloud Function

↓

Generate QR

↓

Store Ticket

↓

Send Email

↓

Dashboard Updated

↓

Ready for Check-in
```

QR generation MUST happen inside Firebase Cloud Functions.

Never on the client.

---

# 8. Organizer Workspace Philosophy

The dashboard should feel like a production control room.

Not a CRUD application.

Every screen answers:

"What is happening with my event right now?"

The homepage should immediately display:

* Current event
* Timeline progress
* Team activity
* Upcoming deadlines
* Pending bookings
* Ticket sales
* Calendar
* Notifications

---

# 9. Team Collaboration

Each event includes its own workspace.

Features

* Task management
* Comments
* Attachments
* Mentions
* Due dates
* Activity history

Supported board views

* Kanban
* Calendar
* Timeline
* List

---

# 10. Organizer Website

Each organizer owns a mini-website.

Sections

* Hero
* About
* Gallery
* Videos
* Upcoming events
* Past events
* Reviews
* Contact

Customization

* Logo
* Colors
* Typography
* Hero image
* Cover video
* Theme
* Layout

Future support

* Custom domains

---

# 11. Motion Language

Every interaction should feel smooth and intentional.

Approved animation types

* Fade
* Scale
* Slide
* Blur
* Shared Element Transition
* Spring Motion
* Stagger Animation
* Scroll Reveal

Avoid

* Flashing animations
* Large rotations
* Random bouncing
* Excessive parallax

---

# 12. Design System Rules

Only use components from

* shadcn/ui
* 21st.dev
* ReactBits

Never reinvent a component unless absolutely necessary.

If customization is required, extend the existing component.

---

# 13. Technology Stack

Frontend

* Next.js 15
* React 19
* TypeScript
* Tailwind CSS v4

UI

* shadcn/ui
* 21st.dev
* ReactBits
* Motion
* Lucide Icons
* Geist Font

Backend

* Firebase Authentication
* Firestore
* Firebase Storage
* Firebase Cloud Functions
* Firebase Cloud Messaging

Third-party

* Resend
* Google Maps
* FullCalendar
* dnd-kit

---

# 14. Performance Targets

Lighthouse

95+

Accessibility

100

SEO

100

Performance

95+

Best Practices

100

Page load

< 2 seconds

Interaction delay

< 100ms

---

# 15. Accessibility

Required

* Keyboard navigation
* Screen reader support
* Focus states
* Reduced motion support
* Color contrast compliance
* Semantic HTML

Accessibility is mandatory.

---

# 16. Security

All sensitive logic runs inside Cloud Functions.

Examples

* QR generation
* Email sending
* Ticket approval
* Analytics aggregation

Firestore rules must deny all access by default.

Grant permissions explicitly.

---

# 17. Notifications

Use floating notifications.

Never use blocking modal dialogs unless confirmation is required.

Notification types

* Success
* Warning
* Error
* Information
* Live Activity

Realtime updates should use Firestore listeners.

---

# 18. Future AI Features

Reserved architecture for

* AI Event Planner
* AI Marketing Generator
* AI Budget Assistant
* AI Timeline Generator
* AI Copywriter
* AI Support Agent
* AI Analytics Assistant

These features must integrate without requiring major architectural changes.

---

# 19. Development Principles

Every implementation must satisfy the following:

* Modular
* Reusable
* Testable
* Accessible
* Performant
* Type-safe
* Responsive
* Documented

Never sacrifice maintainability for speed.

---

# 20. Definition of Done

A feature is considered complete only if it includes:

* Functional implementation
* Responsive layout
* Dark mode support
* Loading states
* Empty states
* Error states
* Animations
* Accessibility
* Type safety
* Documentation
* Firebase integration
* Security validation
* Performance optimization

If any item above is missing, the feature is **not complete**.

---

# 21. Success Criteria

The MVP is successful when:

Attendees can

* Discover events
* Book events
* Upload receipts
* Receive QR tickets
* Attend events

Organizers can

* Create events
* Manage production
* Manage teams
* Track progress
* Approve bookings
* Scan attendees
* Analyze performance

Super Admins can

* Manage the platform
* Moderate content
* Monitor health
* Support organizers
* Access platform analytics

---

# 22. Source of Truth

This document is the primary reference for every future document in the EvenTech Blueprint.

Every implementation phase, component, database schema, Cloud Function, and UI screen must comply with this specification.

Violation of this specification requires updating the specification first before implementation proceeds.
