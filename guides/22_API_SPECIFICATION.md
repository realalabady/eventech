# 22_API_SPECIFICATION.md

> **EvenTech Backend API & Cloud Functions Specification**
>
> Version: MVP 1.0

---

# Purpose

This document defines the contract between the frontend and the backend.

Even though EvenTech uses Firebase, **all business logic is exposed through Firebase Cloud Functions**, effectively acting as the platform's API.

The frontend should never directly perform sensitive business operations.

---

# API Philosophy

Client

↓

Cloud Function

↓

Firestore

↓

Response

The client requests.

The backend validates.

The backend decides.

---

# API Standards

## Request

```ts
{
  data: {}
}
```

---

## Success Response

```ts
{
  success: true,
  message: string,
  data: {}
}
```

---

## Error Response

```ts
{
  success: false,
  code: string,
  message: string
}
```

---

# Authentication APIs

---

## registerUser

Creates a new user profile.

### Input

```ts
{
  email
  password
  displayName
}
```

Returns

User

Profile

JWT Session

---

## loginUser

Returns authenticated session.

---

## logoutUser

Invalidates current session.

---

## resetPassword

Sends password reset email.

---

## verifyEmail

Marks account verified.

---

# Organization APIs

---

## createOrganization

Creates a new organization.

### Input

```ts
{
  name
  description
  iban
}
```

Returns

Organization

Owner Membership

Default Workspace

---

## updateOrganization

Updates branding and profile.

---

## inviteMember

Invites user.

---

## removeMember

Removes member.

---

## updateMemberRole

Updates permissions.

---

# Event APIs

---

## createEvent

Creates draft event.

Input

```ts
{
  organizationId
  title
  description
}
```

Returns

Draft Event

Timeline

Kanban

Calendar

Analytics

---

## updateEvent

Updates draft.

---

## publishEvent

Validates workflow.

Publishes event.

---

## archiveEvent

Archives event.

---

## duplicateEvent

Creates event copy.

---

# Artist APIs

Create Artist

Update Artist

Delete Artist

Search Artists

---

# Venue APIs

Create Venue

Update Venue

Delete Venue

Search Venue

---

# Booking APIs

---

## createBooking

Input

```ts
{
  eventId
  amount
}
```

Creates booking.

Status

Pending.

---

## uploadReceipt

Attaches payment receipt.

---

## approveBooking

Organizer only.

Actions

Generate Ticket

↓

Generate QR

↓

Email User

↓

Update Analytics

↓

Create Activity

---

## rejectBooking

Rejects booking.

Stores reason.

---

# Ticket APIs

---

## generateTicket

Internal.

---

## validateTicket

Scanner.

Returns

Valid

Invalid

Used

Expired

Cancelled

---

## checkInTicket

Marks attendee present.

Realtime dashboard update.

---

# Timeline APIs

Create Milestone

Update Milestone

Complete Milestone

Reorder Timeline

Delete Milestone

---

# Task APIs

Create Task

Update Task

Assign Task

Complete Task

Archive Task

Delete Task

---

# Calendar APIs

Create Event

Update Event

Delete Event

Move Event

Sync Timeline

---

# Messaging APIs

Create Channel

Send Message

Edit Message

Delete Message

Add Member

Remove Member

---

# Notification APIs

Create Notification

Mark Read

Delete Notification

Broadcast Organization

---

# Branding APIs

Update Theme

Update Logo

Update Cover

Update Colors

Update Typography

Preview Theme

---

# Analytics APIs

Organization Dashboard

Event Dashboard

Booking Report

Attendance Report

Revenue Report

Export CSV (Future)

---

# Admin APIs

Users

Organizations

Events

Reports

Feature Flags

Audit Logs

System Health

---

# Search APIs

Global Search

Search Events

Search Artists

Search Venues

Search Users

Search Tasks

Search Bookings

---

# File APIs

Upload Image

Upload Receipt

Upload Logo

Delete File

Optimize Image

---

# Review APIs

Create Review

Update Review

Delete Review

Fetch Reviews

---

# Favorites APIs

Favorite Event

Favorite Artist

Favorite Organizer

Remove Favorite

---

# Activity APIs

Fetch Feed

Filter Feed

Mark Seen

---

# Email APIs

Internal Only

Booking Pending

Booking Approved

Booking Rejected

Invitation

Reminder

QR Ticket

Verification

---

# Scheduler APIs

Nightly Analytics

Cleanup Storage

Reminder Emails

Archive Events

Monthly Reports

---

# API Authorization

Every request validates

Authentication

↓

Organization Membership

↓

Permission

↓

Resource Ownership

↓

Business Rules

↓

Execution

---

# Rate Limits

Authentication

10/minute

Bookings

5/minute

Receipt Upload

10/hour

Invitations

20/hour

Search

60/minute

Notifications

30/minute

---

# Error Codes

```text
AUTH_REQUIRED

PERMISSION_DENIED

INVALID_REQUEST

VALIDATION_ERROR

NOT_FOUND

BOOKING_CLOSED

EVENT_FULL

ALREADY_EXISTS

INVALID_QR

RATE_LIMITED

SERVER_ERROR
```

---

# Logging

Every API call records

Request ID

↓

User

↓

Organization

↓

Execution Time

↓

Result

↓

Errors

↓

Metadata

---

# Performance Targets

Authentication

<300ms

Create Event

<600ms

Approve Booking

<1 second

QR Validation

<250ms

Realtime Update

<100ms

---

# Security Requirements

Every endpoint

✓ Authenticated

✓ Authorized

✓ Validated

✓ Logged

✓ Rate Limited

✓ Type Safe

✓ Cloud Function Only

---

# Versioning Strategy

Current

v1

Future

v2

v3

Maintain backward compatibility whenever possible.

---

# API Design Rules

* One responsibility per endpoint.
* Never expose internal Firestore implementation.
* Return typed responses.
* Fail with meaningful error codes.
* Never trust client-provided values for security-sensitive fields.
* Prefer idempotent operations where appropriate.

---

# Final Principle

The frontend should behave as a **presentation layer**.

The Cloud Functions API is the **business layer**.

Firestore is the **data layer**.

Keeping these responsibilities separate ensures scalability, maintainability, and security as EvenTech grows from an MVP into a global platform.
