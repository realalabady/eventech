# 43_SUPER_ADMIN_SPEC.md

> **EvenTech Super Admin Control Center**
>
> Version: MVP 1.0

---

# Purpose

Define the platform management experience for EvenTech administrators.

The admin system controls platform health, users, organizations, events, security, and growth.

---

# Admin Philosophy

The super admin should operate EvenTech like a platform command center.

The goal:

Visibility.

Control.

Safety.

Growth.

---

# Admin Routes

```text id="n6p4wy"
admin/

dashboard

users

organizations

events

reports

analytics

audit

settings
```

---

# Admin Dashboard

Main overview.

Shows:

```text id="m8r3kv"
Total Users

Total Organizers

Active Events

Bookings

Platform Activity
```

---

# Real-Time Metrics

Cards:

* New users today
* New organizers
* Active events
* Booking activity
* System alerts

Use animated counters.

---

# User Management

Admin can:

View:

* Users
* Roles
* Activity

Actions:

* Suspend
* Restore
* Change role

---

# User Details

Display:

```text id="h2k9ds"
Profile

Account status

Created date

Events attended

Bookings

Activity history
```

---

# Organization Management

Admin manages:

* Hosts
* Verification
* Organization status

---

# Organizer Verification

Workflow:

```text id="s4m7zp"
Pending

↓

Review

↓

Approve

↓

Verified
```

---

# Verified Badge

Verified organizations receive:

* Public badge
* Increased trust
* Better visibility

---

# Event Moderation

Admin can:

* Review events
* Hide events
* Remove inappropriate content

---

# Event Detail View

Shows:

* Organizer
* Event information
* Activity
* Bookings
* Reports

---

# Reports System

Users can report:

* Events
* Organizers
* Users

---

# Report Categories

```text id="w5p8hm"
Fake Event

Payment Issue

Inappropriate Content

Safety Concern

Other
```

---

# Report Workflow

```text id="k3v6mx"
Submitted

↓

Review

↓

Action

↓

Resolved
```

---

# Audit Logs

Every important admin action is recorded.

Examples:

* User suspended
* Organizer approved
* Event removed

---

# Audit Document

```typescript id="y9q4tb"
{
actorId,

action,

targetId,

targetType,

metadata,

timestamp
}
```

---

# Analytics

Admin analytics:

* Growth
* Retention
* Events
* Bookings
* Platform activity

---

# Feature Flags

Admin can control:

* Experimental features
* Beta releases
* Platform settings

---

# Platform Settings

Controls:

* Limits
* Categories
* Notifications
* System configuration

---

# Security

Admin actions require:

* Authentication
* Admin role
* Permission verification

Sensitive actions run through Cloud Functions.

---

# Admin Notifications

Examples:

* Suspicious activity
* Large event created
* Report received
* System issue

---

# Admin UI Style

Should feel like:

* Linear Admin
* Vercel Dashboard
* Stripe Dashboard

Not:

Traditional ERP.

---

# Performance

Admin tables require:

* Pagination
* Search
* Filters
* Lazy loading

---

# Future Features

Not MVP:

* Revenue management
* AI moderation
* Fraud detection
* Automated verification
* Advanced reporting

---

# Final Principle

The super admin system protects the ecosystem.

It should provide enough control to maintain trust while staying invisible to normal users.

A healthy platform creates healthy events.
