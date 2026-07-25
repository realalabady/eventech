# 10_FIRESTORE_SECURITY_RULES.md

> **EvenTech Firestore Security Rules Specification**
>
> Version: 1.0

---

# Purpose

This document defines the complete security model for Firestore.

Security is based on **Zero Trust**.

Every request is denied unless explicitly allowed.

---

# Security Philosophy

Never trust:

* Client applications
* Browser requests
* Mobile apps
* Hidden UI
* Disabled buttons

Always trust:

* Firebase Authentication
* Firebase Security Rules
* Firebase Cloud Functions

---

# Zero Trust Model

```text
User Request

↓

Authentication

↓

Security Rules

↓

Permission Check

↓

Organization Validation

↓

Document Ownership

↓

Allow / Deny
```

---

# Security Priorities

1. Authentication
2. Authorization
3. Ownership
4. Organization Isolation
5. Least Privilege
6. Auditability

---

# Authentication Rules

Anonymous users

❌ Cannot write

❌ Cannot upload

❌ Cannot create bookings

✅ Can browse public events

---

Authenticated users

Can only access resources they own unless explicitly granted.

---

# Roles

```text
Guest

↓

Attendee

↓

Organizer

↓

Manager

↓

Staff

↓

Scanner

↓

Super Admin
```

---

# Permission Model

Permissions are not based only on roles.

They are based on

Role

*

Organization Membership

*

Resource Ownership

*

Business Rules

---

# Organization Isolation

Organization A must never read data from Organization B.

Every protected document includes

```ts
organizationId
```

Every rule validates it.

---

# Ownership Validation

Every user-owned document contains

```ts
userId
```

Rules verify

```text
request.auth.uid == resource.data.userId
```

---

# Public Collections

Readable without authentication

* Public Events
* Public Organizer Profiles
* Artists
* Venues
* Categories

Everything else requires authentication.

---

# Users Collection

Users

Can Read

Own profile

Can Update

Own profile

Cannot

Change role

Change permissions

Change verification

Change analytics

---

# Organizations

Public

Basic profile

Private

Settings

Members

Analytics

IBAN

Permissions

Only organization members can access private data.

---

# Organization Members

Owner

Full Access

Manager

Most Access

Staff

Assigned Modules

Scanner

Check-in Only

---

# Events

Public Event

Readable

Everyone

Draft Event

Only organization members.

Archived Event

Organization members.

---

# Bookings

Attendee

Own bookings only.

Organizer

Bookings belonging to organization.

Staff

Permission dependent.

Super Admin

Everything.

---

# Tickets

Attendee

Own ticket.

Organizer

Organization tickets.

Scanner

Read validation only.

Cannot modify.

---

# Check-ins

Only

Scanners

Managers

Owners

Can create.

Attendees

Cannot modify.

---

# Timeline

Organization Members

Read

Write according to permissions.

Public

No access.

---

# Tasks

Assigned Member

Read

Update

Managers

Create

Assign

Delete

Owners

Everything

---

# Kanban

Members

Realtime Read

Realtime Update

Public

No access.

---

# Calendar

Members only.

---

# Messages

Only members inside the same organization.

---

# Media

Public assets

Readable

Private assets

Permission based.

Receipts

Only

Booking owner

Organizer

Admin

---

# Notifications

Users only read

Their own notifications.

---

# Activity Feed

Organization members.

Super Admin.

---

# Reviews

Public Read

Authenticated Write

One review per attendee per event.

---

# Feature Flags

Only

Super Admin.

---

# Audit Logs

Never readable by clients.

Cloud Functions only.

---

# Storage Rules

Profile Images

Owner

Organizer Logos

Organization Members

Receipts

Booking Owner

Organization

Admin

QR Codes

Never public.

Access controlled.

---

# Write Restrictions

Every write validates

Authentication

↓

Role

↓

Ownership

↓

Organization

↓

Document Structure

↓

Business Rules

---

# Immutable Fields

Client cannot modify

createdAt

createdBy

organizationId

userId

ticketId

bookingId

analytics

verification

role

---

# Allowed Client Updates

Examples

Display Name

Avatar

Theme

Preferences

Notification Settings

Bio

Phone

---

# Forbidden Client Updates

Revenue

Analytics

Roles

Permissions

Verification

Ticket Status

Booking Approval

Workflow Stage

Check-in

---

# Rate Limiting

Implemented through Cloud Functions.

Protect

Booking spam

Login abuse

Receipt uploads

Invitations

Notifications

---

# Validation Rules

Every document validates

Required fields

Correct types

Maximum lengths

Allowed values

Reference integrity

---

# Example Limits

Organization Name

100 characters

Bio

1000 characters

Event Description

5000 characters

Task Title

200 characters

Review

1000 characters

---

# Firestore Rules Helpers

Create helper functions

```text
isAuthenticated()

isOrganizer()

isOwner()

isOrganizationMember()

isAdmin()

ownsDocument()

isEventManager()

isScanner()
```

Keep rules modular.

---

# Security Layers

Layer 1

Firebase Auth

↓

Layer 2

Firestore Rules

↓

Layer 3

Cloud Functions

↓

Layer 4

Audit Logs

↓

Layer 5

Monitoring

---

# Audit Policy

Log

Booking Approval

Booking Rejection

QR Generation

Role Changes

Permission Changes

Organization Updates

Check-ins

Event Publishing

---

# Admin Access

Super Admin

Bypasses organization isolation.

Every action

Logged.

Audited.

---

# Future Security

App Check

Multi-Factor Authentication

Organization API Keys

OAuth Integrations

Hardware Security Keys

SSO

Enterprise IAM

---

# Security Testing

Before production verify

Unauthorized reads

Unauthorized writes

Cross-organization access

Role escalation

Document tampering

Replay attacks

Invalid QR validation

Receipt manipulation

---

# Security Principles

* Deny by default.
* Allow explicitly.
* Validate ownership.
* Validate organization.
* Never trust the client.
* Log sensitive actions.
* Keep permissions granular.
* Prefer Cloud Functions for sensitive operations.

---

# Production Checklist

✓ Firestore Rules Deployed

✓ Storage Rules Deployed

✓ Indexes Deployed

✓ App Check Enabled

✓ Audit Logging Enabled

✓ Cloud Functions Protected

✓ Environment Variables Secured

✓ Service Accounts Restricted

✓ Backup Schedule Configured

✓ Monitoring Enabled

---

# Golden Rule

Every piece of data belongs to someone.

Every request must answer four questions before access is granted:

1. Who is making this request?
2. What are they trying to access?
3. Do they own it or have permission?
4. Does the current business state allow this action?

If any answer is **No**, the request must be denied.
