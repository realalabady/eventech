# 25_FIREBASE_ARCHITECTURE.md

> **EvenTech Firebase Architecture**
>
> Version: MVP 1.0

---

# Purpose

This document defines the complete Firebase architecture used by EvenTech.

Firebase is the backbone of the platform.

It provides

* Authentication
* Database
* Storage
* Cloud Functions
* Security
* Realtime
* Analytics
* Hosting integrations

Everything must follow this architecture.

---

# Firebase Services

EvenTech uses

```text id="r6m7qs"
Firebase Authentication

↓

Cloud Firestore

↓

Firebase Storage

↓

Cloud Functions Gen2

↓

Firebase App Check

↓

Firebase Cloud Messaging (Future)

↓

Firebase Analytics (Future)
```

---

# Overall Architecture

```text id="hqq2h9"
                 Next.js

                     │

                     ▼

          Firebase Authentication

                     │

                     ▼

             Firebase App Check

                     │

                     ▼

          Cloud Functions (Gen2)

                     │

      ┌──────────────┼──────────────┐
      ▼              ▼              ▼

 Firestore      Firebase Storage    Resend

      │              │

      └──────────────┘

             Analytics
```

The frontend never directly performs privileged actions.

---

# Authentication

Provider

Firebase Authentication

Supported

* Email & Password
* Google

Future

* Apple
* GitHub
* Microsoft

---

# User Lifecycle

```text id="q0nlip"
Register

↓

Verify Email

↓

Create Firestore User

↓

Complete Onboarding

↓

Access Dashboard
```

---

# Firestore

Database Type

Cloud Firestore

Mode

Native

Realtime

Enabled

Offline Persistence

Enabled

---

# Root Collections

```text id="2g5bwu"
users
organizations
organizationMembers
events
bookings
tickets
tasks
timeline
calendarEvents
artists
venues
notifications
channels
messages
activityLogs
analytics
reviews
favorites
auditLogs
featureFlags
systemSettings
```

---

# Firestore Principles

* Optimize for reads.
* Prefer denormalized documents.
* Keep documents under 1 MB.
* Use batched writes where possible.
* Use transactions for critical updates.
* Never expose sensitive business logic to clients.

---

# Firebase Storage

Buckets

```text id="6m0yl5"
avatars/

organization-logos/

organization-covers/

event-covers/

event-gallery/

artist-images/

venue-images/

receipts/

tickets/

attachments/
```

---

# File Rules

Images

* JPG
* PNG
* WebP

Documents

* PDF

Receipts

* JPG
* PNG
* PDF

Maximum Upload Size

20 MB

---

# Storage Metadata

Every uploaded file stores

```ts id="mjlwmu"
{
  uploadedBy
  organizationId
  eventId
  createdAt
  contentType
  size
}
```

---

# Cloud Functions

Runtime

Node.js 22

Language

TypeScript

Generation

Gen2

Region

Closest to primary users (configurable)

---

# Cloud Function Categories

Authentication

Bookings

QR

Events

Notifications

Emails

Analytics

Maintenance

Admin

---

# Authentication Functions

* createUserProfile
* deleteUserData
* assignUserRole

---

# Event Functions

* createEvent
* publishEvent
* archiveEvent
* duplicateEvent

---

# Booking Functions

* createBooking
* approveBooking
* rejectBooking
* uploadReceipt

---

# Ticket Functions

* generateQRCode
* generateTicket
* validateTicket
* checkInTicket

---

# Notification Functions

* createNotification
* broadcastOrganization
* sendReminder

---

# Email Functions

Uses

Resend

Templates

* Welcome
* Verify Email
* Booking Pending
* Booking Approved
* Booking Rejected
* QR Ticket
* Invitation

---

# Analytics Functions

Nightly

Daily

Realtime

Monthly

---

# Scheduled Functions

Every Hour

Cleanup expired temporary files.

---

Every Day

Archive completed events.

Refresh analytics.

Send reminders.

---

Every Month

Generate reports.

Cleanup logs.

Optimize analytics.

---

# Firestore Triggers

User Created

↓

Create profile

Create preferences

Create statistics

---

Booking Approved

↓

Generate QR

Create ticket

Send email

Update analytics

Create notification

---

Task Completed

↓

Update timeline

Update analytics

Activity log

---

Event Published

↓

Notify followers

Update discover page

Create activity

---

# Storage Triggers

Receipt Uploaded

↓

Validate

↓

Store metadata

↓

Notify organizer

---

# App Check

Required

Web App

Cloud Functions

Firestore

Storage

Reject requests without valid App Check tokens.

---

# Firestore Security Rules

Every request validates

Authentication

↓

Organization Membership

↓

Role

↓

Ownership

↓

Business Rules

↓

Allow / Deny

---

# Storage Rules

Avatar

Owner only

Organization Logo

Organization Admins

Receipts

Booking Owner

Event Media

Organization Members

---

# Environment Variables

Frontend

```text id="df6pg8"
NEXT_PUBLIC_FIREBASE_API_KEY

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN

NEXT_PUBLIC_FIREBASE_PROJECT_ID

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID

NEXT_PUBLIC_FIREBASE_APP_ID
```

Backend

```text id="i2jpfg"
RESEND_API_KEY

GOOGLE_MAPS_API_KEY

APP_URL

ADMIN_EMAIL
```

---

# Firebase Emulator

Development uses

Authentication Emulator

Firestore Emulator

Storage Emulator

Functions Emulator

No production data during local development.

---

# Logging

Cloud Functions log

Execution Time

↓

User

↓

Organization

↓

Errors

↓

Metadata

↓

Request ID

---

# Monitoring

Track

Function Failures

Firestore Usage

Storage Usage

Authentication Errors

API Latency

Cold Starts

---

# Cost Optimization

* Limit realtime listeners.
* Batch writes.
* Avoid unnecessary document reads.
* Paginate large collections.
* Compress uploaded images.
* Archive inactive data.
* Use indexes efficiently.

---

# Disaster Recovery

Daily Firestore export.

Storage backups.

Audit logs retained.

Versioned Cloud Functions.

---

# Deployment Pipeline

```text id="0g2gg7"
GitHub

↓

Pull Request

↓

Preview Deployment (Vercel)

↓

Review

↓

Merge

↓

Production Deployment

↓

Cloud Functions Deploy

↓

Firestore Rules Deploy

↓

Storage Rules Deploy
```

---

# Security Checklist

✓ Firebase Auth

✓ App Check

✓ Firestore Rules

✓ Storage Rules

✓ Cloud Functions Validation

✓ Audit Logs

✓ Rate Limiting

✓ Email Verification

✓ Role-Based Access

---

# Performance Targets

Authentication

<300 ms

Firestore Read

<100 ms

Realtime Update

<100 ms

QR Validation

<250 ms

Booking Approval

<1 second

---

# Future Firebase Services

* Cloud Messaging
* Remote Config
* Crashlytics (if mobile apps)
* Performance Monitoring
* Vertex AI Integration
* Extensions (Image Resize, etc.)

---

# Final Principle

Firebase is not just the backend—it is the platform infrastructure.

Every feature should be designed to leverage Firebase's strengths:

* Realtime synchronization
* Event-driven architecture
* Secure authentication
* Scalable serverless functions
* Efficient document storage

The frontend should remain lightweight, while Cloud Functions and Firestore handle the business logic and application state securely and efficiently.
