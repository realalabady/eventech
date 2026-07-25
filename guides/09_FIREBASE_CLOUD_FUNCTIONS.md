# 09_FIREBASE_CLOUD_FUNCTIONS.md

> **EvenTech Firebase Cloud Functions Specification**
>
> Version: 1.0

---

# Purpose

This document defines every Firebase Cloud Function used by EvenTech.

Cloud Functions are responsible for all trusted business logic.

**Golden Rule**

> If compromising the client could abuse a feature, that feature belongs inside a Cloud Function.

---

# Runtime

Runtime

* Node.js 22

Language

* TypeScript

Generation

* Cloud Functions Gen 2

Region

* Single region during MVP
* Multi-region ready architecture

---

# Folder Structure

```text
functions/
│
├── src/
│   │
│   ├── auth/
│   ├── users/
│   ├── organizations/
│   ├── events/
│   ├── bookings/
│   ├── tickets/
│   ├── timeline/
│   ├── tasks/
│   ├── analytics/
│   ├── notifications/
│   ├── storage/
│   ├── email/
│   ├── qr/
│   ├── scheduler/
│   ├── admin/
│   ├── shared/
│   └── index.ts
```

---

# Shared Utilities

Every function can use

* Logger
* Auth Validator
* Permission Validator
* Firestore Helper
* Storage Helper
* QR Generator
* Email Client
* Date Utilities
* Error Handler
* Analytics Service

---

# Authentication Functions

## createUserProfile

Trigger

```text
Firebase Auth User Created
```

Responsibilities

* Create Firestore profile
* Assign default role
* Create preferences
* Create notification settings
* Create analytics document

---

## deleteUserCleanup

Trigger

```text
User Deleted
```

Responsibilities

* Remove private data
* Revoke invitations
* Archive profile

---

# Organization Functions

## createOrganization

Callable Function

Responsibilities

* Validate organizer
* Create organization
* Create branding document
* Create default workspace
* Create analytics
* Create default workflow

---

## inviteMember

Callable

Responsibilities

* Validate permissions
* Generate invite token
* Store invitation
* Send email

---

## acceptInvitation

Callable

Responsibilities

* Verify token
* Add member
* Assign role
* Create activity
* Notify organization

---

# Event Functions

## createEvent

Callable

Responsibilities

* Validate data
* Generate slug
* Create event
* Create timeline
* Create kanban
* Create calendar
* Create analytics
* Create activity

---

## publishEvent

Callable

Responsibilities

* Verify workflow
* Verify venue
* Verify ticket availability
* Verify artwork
* Publish event
* Notify followers
* Update search index

---

## archiveEvent

Callable

Responsibilities

* Archive event
* Freeze edits
* Generate report
* Update analytics

---

# Booking Functions

## createBooking

Callable

Responsibilities

* Validate event
* Validate capacity
* Validate ticket type
* Save booking
* Create activity
* Notify organizer

---

## uploadReceiptComplete

Storage Trigger

Responsibilities

* Verify upload
* Attach receipt
* Notify organizer
* Update booking

---

## approveBooking

Callable

Responsibilities

* Verify permissions
* Verify booking
* Generate ticket
* Generate QR
* Save ticket
* Send email
* Update analytics
* Notify attendee
* Create activity

---

## rejectBooking

Callable

Responsibilities

* Reject booking
* Save reason
* Notify attendee
* Update analytics

---

# Ticket Functions

## generateTicket

Internal Function

Responsibilities

* Create ticket number
* Generate secure token
* Save ticket

---

## generateQRCode

Internal Function

Responsibilities

* Create encrypted QR payload
* Render QR
* Upload image
* Return URL

---

## validateTicket

Callable

Responsibilities

* Validate QR
* Validate event
* Validate status
* Validate ownership
* Return result

---

## checkInTicket

Callable

Responsibilities

* Verify scanner role
* Mark ticket used
* Save check-in
* Update analytics
* Notify dashboard

---

# Timeline Functions

## completeTimelineStep

Callable

Responsibilities

* Complete milestone
* Unlock next milestone
* Update progress
* Notify workspace
* Update analytics

---

## reorderTimeline

Callable

Responsibilities

* Validate order
* Save positions
* Broadcast update

---

# Task Functions

## createTask

## updateTask

## assignTask

## completeTask

## archiveTask

Every task update

Creates activity

Updates analytics

Updates dashboard

Triggers notification

---

# Notification Functions

## createNotification

Internal

Supports

* Push
* In-App
* Email

---

## markNotificationRead

Callable

---

## broadcastOrganizationNotification

Callable

Organization-wide announcement.

---

# Email Functions

Provider

Resend

Templates

Welcome

↓

Booking Pending

↓

Booking Approved

↓

Booking Rejected

↓

QR Ticket

↓

Invitation

↓

Password Reset

↓

Reminder

↓

Event Update

↓

Event Cancelled

---

# QR Security

QR Payload

Contains

```text
Ticket ID

Encrypted Signature

Organization ID

Event ID

Issued Timestamp

Version
```

Never expose sensitive information.

---

# Analytics Functions

## updateDashboardMetrics

Triggered by

Booking

Task

Timeline

Check-in

Event

---

## generateDailyAnalytics

Scheduler

Runs every night.

---

## generateMonthlyReport

Scheduler

Creates organization reports.

---

# Search Functions

Future

Algolia Sync

Typesense Sync

Search Index Updates

---

# Storage Functions

## optimizeImage

Trigger

Image Upload

Responsibilities

Resize

Compress

Generate thumbnail

Store metadata

---

## deleteUnusedFiles

Scheduler

Runs weekly.

---

# Scheduler Functions

Every Hour

Pending booking cleanup

Every Night

Analytics aggregation

Every Morning

Reminder emails

Every Week

Storage cleanup

Every Month

Reports

Every Year

Archive old events

---

# Admin Functions

Create Feature Flag

Enable Feature

Disable Feature

Ban User

Suspend Organization

Restore Organization

Platform Statistics

---

# Audit Logging

Every Cloud Function logs

```text
Timestamp

User

Organization

Function

Action

Result

Execution Time

Metadata
```

---

# Error Codes

Standardized

```text
AUTH_REQUIRED

PERMISSION_DENIED

INVALID_INPUT

NOT_FOUND

ALREADY_EXISTS

BOOKING_CLOSED

EVENT_FULL

INVALID_QR

TICKET_USED

SERVER_ERROR
```

---

# Retry Policy

Retry

Storage Processing

Email

Analytics

Never retry

Authentication failures

Permission failures

Validation failures

---

# Security Checklist

Every callable function must

✓ Authenticate user

✓ Validate input

✓ Validate permissions

✓ Verify organization ownership

✓ Verify event ownership

✓ Log execution

✓ Handle exceptions

✓ Return typed response

---

# Performance Targets

Cold Start

< 2 seconds

Average Execution

< 500ms

Ticket Validation

< 250ms

QR Generation

< 500ms

Booking Approval

< 1 second

---

# Cloud Function Naming Convention

```text
verb + Resource

Examples

createEvent

publishEvent

approveBooking

generateQRCode

validateTicket

completeTask

archiveEvent

sendReminderEmail
```

---

# Deployment Pipeline

```text
Developer

↓

Git Push

↓

GitHub

↓

CI

↓

Lint

↓

Type Check

↓

Build

↓

Deploy Cloud Functions

↓

Deploy Firestore Rules

↓

Deploy Indexes

↓

Production
```

---

# Future Functions

AI Event Planner

AI Timeline Generator

AI Budget Assistant

AI Marketing Writer

AI Image Generator

Stripe Integration

Tamara Integration

Apple Wallet

Google Wallet

Webhook API

GraphQL Gateway

---

# Cloud Function Rule

Cloud Functions are the trusted brain of EvenTech.

Every action that affects money, permissions, tickets, analytics, security, notifications, or workflow progression must execute on the backend.

The frontend requests.

The backend decides.
