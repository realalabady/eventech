# 36_FIREBASE_ARCHITECTURE.md

> **EvenTech Firebase Backend Architecture**
>
> **Database, Authentication, Storage, Security & Cloud Functions Design**
>
> Version: 1.0

---

# Mission

Firebase is the foundation of EvenTech's backend.

The architecture must provide:

* Realtime collaboration
* Secure multi-user access
* Scalable event management
* Fast booking workflows
* Reliable ticket generation
* Future enterprise scalability

---

# Firebase Services

EvenTech uses:

```text id="j7b3pf"
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

Firebase Hosting / Vercel Integration
```

---

# Architecture Philosophy

The frontend never owns business rules.

The client requests actions.

Firebase validates.

Cloud Functions execute.

Firestore stores the final state.

---

# User Roles

EvenTech has three primary roles.

---

# 1. Attendee

Purpose:

Discover and join events.

Permissions:

Can:

* Create profile
* Browse public events
* Follow organizers
* Submit booking requests
* Upload payment receipts
* Receive tickets
* View personal history

Cannot:

* Create events
* Manage organizations
* Approve bookings

---

# 2. Organizer / Host

Purpose:

Create and manage events.

Permissions:

Can:

* Create organization profile
* Customize public profile
* Create events
* Manage workflow
* Add team members
* Manage tasks
* Approve bookings
* View analytics

Cannot:

* Access platform administration
* Modify other organizations

---

# 3. Super Admin

Purpose:

Control the platform.

Permissions:

Can:

* Manage users
* Manage organizers
* Review events
* View analytics
* Suspend accounts
* Configure platform settings

---

# Authentication Architecture

Firebase Auth Providers:

MVP:

* Email/password
* Google Login

Future:

* Apple
* Phone OTP
* Social providers

---

# User Document

Collection:

```text id="2vx9hb"
users/{userId}
```

Schema:

```typescript
{
  uid: string;

  email: string;

  displayName: string;

  avatarUrl?: string;

  role:
    "attendee" |
    "organizer" |
    "admin";

  phone?: string;

  country?: string;

  createdAt: Timestamp;

  updatedAt: Timestamp;
}
```

---

# Organizer Profile

Collection:

```text id="w3f3md"
organizations/{organizationId}
```

Schema:

```typescript
{
  id: string;

  ownerId: string;

  name: string;

  slug: string;

  description: string;

  logoUrl: string;

  coverImageUrl: string;

  theme: {

    primaryColor:string;

    secondaryColor:string;

    font:string;

  };

  socialLinks: {

    instagram?:string;

    website?:string;

  };

  verified:boolean;

  createdAt:Timestamp;
}
```

---

# Events Collection

Collection:

```text id="8sg4z4"
events/{eventId}
```

Schema:

```typescript
{
 id:string;

 organizationId:string;

 title:string;

 description:string;

 coverImage:string;

 category:string;

 status:

 "draft" |
 "planning" |
 "published" |
 "completed" |
 "cancelled";


 venue:{

   name:string;

   address:string;

   latitude:number;

   longitude:number;

 };


 date:Timestamp;

 startTime:string;

 endTime:string;


 capacity:number;

 attendeeCount:number;


 ticketType:

 "general";


 paymentMethod:{

   iban:string;

 };


 workflowStage:

 "location" |
 "planning" |
 "announcement" |
 "booking" |
 "execution" |
 "completed";


 createdAt:Timestamp;
}
```

---

# Event Workflow System

Every event follows:

```text id="r6d8ml"
Idea

↓

Location

↓

Planning

↓

Team Preparation

↓

Announcement

↓

Booking Open

↓

Event Day

↓

Completed
```

---

# Timeline Collection

Collection:

```text id="1xryj5"
events/{eventId}/timeline/{timelineId}
```

Schema:

```typescript
{
 title:string;

 description:string;

 status:

 "locked" |
 "active" |
 "completed";


 dueDate:Timestamp;

 order:number;

 completedAt?:Timestamp;
}
```

---

# Tasks / Kanban System

Collection:

```text id="41k94w"
events/{eventId}/tasks/{taskId}
```

Schema:

```typescript
{
 title:string;

 description:string;

 assignedTo:string;

 status:

 "todo" |
 "in-progress" |
 "review" |
 "completed";


 priority:

 "low" |
 "medium" |
 "high";


 dueDate:Timestamp;

 createdAt:Timestamp;
}
```

---

# Team Members

Collection:

```text id="vh5q48"
organizations/{organizationId}/members/{memberId}
```

Schema:

```typescript
{
 userId:string;

 role:

 "manager" |
 "designer" |
 "security" |
 "finance" |
 "staff";


 permissions:string[];

 joinedAt:Timestamp;
}
```

---

# Booking System

Collection:

```text id="n8h4aq"
bookings/{bookingId}
```

Schema:

```typescript
{
 eventId:string;

 attendeeId:string;


 status:

 "pending" |
 "approved" |
 "rejected";


 payment:

 {

 receiptUrl:string;

 submittedAt:Timestamp;

 };


 approvedAt?:Timestamp;


 createdAt:Timestamp;
}
```

---

# Ticket System

Collection:

```text id="39b3wq"
tickets/{ticketId}
```

Schema:

```typescript
{
 eventId:string;

 bookingId:string;

 attendeeId:string;


 qrCode:string;


 status:

 "valid" |
 "used" |
 "cancelled";


 createdAt:Timestamp;
}
```

---

# QR Code Generation Flow

```text id="j2j0al"
Booking Approved

↓

Cloud Function Trigger

↓

Generate Unique Ticket ID

↓

Create QR Code

↓

Save Ticket

↓

Send Email via Resend

↓

User Receives Ticket
```

---

# Firebase Storage Structure

```text id="e9q5k8"
storage/

users/

avatars/


organizations/

logos/

covers/

gallery/


events/

covers/

tickets/

receipts/
```

---

# Firestore Security Philosophy

Never trust frontend requests.

Every write checks:

```text id="w6r8t0"
Is user authenticated?

↓

Does role allow this?

↓

Does user own resource?

↓

Is request valid?

↓

Allow / Reject
```

---

# Cloud Functions Responsibilities

Functions handle:

## Booking

* Validate request
* Approve booking
* Reject booking

---

## Ticket

* Generate QR
* Verify QR
* Check-in

---

## Email

* Booking confirmation
* Ticket delivery
* Event updates

---

## Analytics

* Attendance metrics
* Booking statistics
* User activity

---

## Scheduled Jobs

* Event reminders
* Cleanup
* Reports

---

# Realtime Features

Firestore listeners power:

* Live attendee count
* Booking activity
* Task updates
* Timeline progress
* Notifications

---

# Offline Strategy

Future support:

* Offline task viewing
* Cached events
* Draft creation

---

# Firebase Performance Rules

Avoid:

❌ Listening to entire collections

❌ Large documents

❌ Unnecessary realtime subscriptions

❌ Duplicating huge data

---

# Index Strategy

Required indexes for:

Events:

* Date
* Status
* Organization

Bookings:

* Event
* Status

Tasks:

* Assigned user
* Status
* Due date

---

# Backup Strategy

Future:

* Scheduled Firestore exports
* Storage backups
* Audit logs

---

# Scalability Path

MVP:

Firebase only.

Growth:

Firebase +

Cloud Run services.

Enterprise:

Firebase +

Dedicated backend services.

---

# Final Principle

Firebase should make EvenTech feel realtime and effortless.

The architecture must protect user data, simplify workflows, and allow the platform to grow from a music event MVP into a global event operating system.

Build the backend like millions of users are coming tomorrow.
