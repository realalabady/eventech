# 46_API_AND_SERVICE_CONTRACTS.md

> **EvenTech Internal API & Service Contracts**
>
> Version: MVP 1.0

---

# Purpose

Define communication contracts between:

* Frontend
* Firebase Services
* Cloud Functions
* External Services

EvenTech MVP uses Firebase-first architecture.

No traditional REST API is required initially.

Cloud Functions act as the backend API layer.

---

# Architecture

```text id="4z9p2x"
React / Next.js Frontend

↓

Firebase SDK

↓

Cloud Functions

↓

Firestore

↓

External Services
```

---

# Service Communication Rules

Frontend can:

* Read public Firestore data
* Call approved Cloud Functions
* Upload approved files

Frontend cannot:

* Modify protected data directly
* Generate tickets
* Approve bookings
* Change permissions

---

# Authentication Service

Provider:

Firebase Authentication

---

# Login Contract

Method:

Firebase SDK

Input:

```typescript id="0fh6zj"
{
email:string;

password:string;
}
```

Output:

```typescript id="v4z8ga"
{
user;

idToken;

refreshToken;
}
```

---

# User Profile Service

## Get Current User

Purpose:

Retrieve profile.

Path:

```text id="q0p3fd"
users/{uid}
```

Response:

```typescript id="x2q9fv"
{
uid,

name,

avatar,

role,

preferences
}
```

---

# Event Service

---

# Create Event

Function:

```text id="k3f7hz"
createEvent()
```

---

Input:

```typescript id="8x4zqk"
{
title:string;

description:string;

category:string;

venue:Object;

date:Timestamp;
}
```

---

Validation:

* User authenticated
* User organizer
* Required fields exist

---

Response:

```typescript id="2v5qmx"
{
success:true;

eventId:string;
}
```

---

# Publish Event

Function:

```text id="m9t3bd"
publishEvent()
```

---

Input:

```typescript id="q7v1pr"
{
eventId:string
}
```

---

Response:

```typescript id="d2k8ax"
{
success:true;

status:"published"
}
```

---

# Booking Service

---

# Create Booking

Function:

```text id="g8n4mv"
createBookingRequest()
```

---

Input:

```typescript id="z5x1qa"
{
eventId:string
}
```

---

Response:

```typescript id="f6b8yw"
{
bookingId:string;

status:"pending"
}
```

---

# Approve Booking

Function:

```text id="p8r4mk"
approveBooking()
```

---

Input:

```typescript id="s1v9qd"
{
bookingId:string
}
```

---

Output:

```typescript id="k2m5vc"
{
success:true;

ticketId:string;
}
```

---

# Reject Booking

Function:

```text id="e7m4pn"
rejectBooking()
```

Input:

```typescript id="n3w8xy"
{
bookingId:string;

reason:string;
}
```

---

# Ticket Service

---

# Generate Ticket

Internal only.

Trigger:

Booking approval.

---

Output:

```typescript id="b6q9sm"
{
ticketId;

qrToken;

status:"active"
}
```

---

# Validate Ticket

Function:

```text id="j8m3zk"
validateTicket()
```

---

Input:

```typescript id="a4r7cw"
{
qrToken:string
}
```

---

Response:

Success:

```typescript id="u7v2kf"
{
valid:true;

ticketId;

eventId;
}
```

---

Failure:

```typescript id="x9n5pm"
{
valid:false;

reason:string;
}
```

---

# Notification Service

Function:

```text id="c5x8nm"
createNotification()
```

---

Input:

```typescript id="y4m6vz"
{
userId;

type;

message;

actionUrl;
}
```

---

# Email Service

Provider:

Resend

---

Functions:

```text id="v8z1pc"
sendTicketEmail()

sendBookingUpdateEmail()

sendEventReminderEmail()
```

---

# Storage Service

Provider:

Firebase Storage

---

# Upload Rules

Supported:

Images:

```text id="w3q7mz"
jpg

png

webp
```

Documents:

```text id="t6n9hx"
pdf
```

---

# Upload Flow

```text id="m7k4pv"
User selects file

↓

Validate size/type

↓

Upload Firebase Storage

↓

Save URL

↓

Update Firestore
```

---

# Analytics Service

Tracks:

```text id="h2q8zx"
event_view

booking_created

ticket_generated

ticket_used

task_completed
```

---

# External Services

---

# Resend

Purpose:

Email delivery.

Used for:

* Tickets
* Notifications
* Reminders

---

# Google Maps

Purpose:

* Venue search
* Coordinates
* Location display

---

# Future Payment Providers

Architecture should support:

* Tamara
* Tabby
* Payment gateways

without changing booking logic.

---

# Error Contract

All functions return:

```typescript id="p3x7mm"
{
success:boolean;

message:string;

errorCode?:string;

data?:unknown;
}
```

---

# Error Codes

Example:

```text id="n8q5bd"
AUTH_REQUIRED

NOT_ALLOWED

EVENT_NOT_FOUND

CAPACITY_FULL

BOOKING_EXISTS

INVALID_TICKET
```

---

# Versioning Strategy

Future:

```text id="r5y8kc"
functions/v1/

functions/v2/
```

Avoid breaking existing clients.

---

# Logging

Every service call logs:

* User ID
* Function name
* Result
* Error

---

# Final Principle

Cloud Functions are the contract between the EvenTech experience and the backend.

Clear contracts prevent bugs, simplify scaling, and allow future mobile apps or external integrations.
