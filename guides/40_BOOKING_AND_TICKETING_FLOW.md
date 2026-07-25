# 40_BOOKING_AND_TICKETING_FLOW.md

> **EvenTech Booking, Payment Verification & QR Ticket System**
>
> Version: MVP 1.0

---

# Purpose

Define the complete attendee booking journey from discovering an event until entering the event using a QR ticket.

The experience must be:

* Simple
* Trustworthy
* Fast
* Secure

---

# Booking Philosophy

The attendee should never feel like they are buying a ticket from a system.

They should feel like they are joining an experience.

---

# Complete Flow

```text id="1s8x3m"
Discover Event

↓

View Event Page

↓

Request Booking

↓

Transfer Payment

↓

Upload Receipt

↓

Host Review

↓

Approval

↓

Generate QR Ticket

↓

Email Delivery

↓

Event Check-in
```

---

# Event Discovery

Attendee can discover:

* Public events
* Organizer profiles
* Upcoming events
* Trending events

---

# Event Page

Contains:

```text id="m0p3tr"
Cover Image

Event Name

Organizer

Date

Location

Description

Gallery

Capacity

Booking Button
```

---

# Booking Request

User clicks:

```text id="tq8m2p"
Book Event
```

System checks:

```text id="o5kl2m"
Is user logged in?

↓

Is event available?

↓

Is capacity available?

↓

Create booking
```

---

# Booking Document Creation

Firestore:

```text id="j9d3vl"
bookings/{bookingId}
```

Initial state:

```typescript id="xq6z8a"
{
status:"pending",

eventId,

attendeeId,

createdAt
}
```

---

# Payment Instructions

After booking creation:

Display:

```text id="z7d1vq"
Host Bank Information

IBAN

Account Holder

Amount

Payment Reference
```

---

# Receipt Upload

User uploads:

* Bank transfer receipt
* Payment proof

Storage:

```text id="54aq8d"
events/{eventId}/receipts/
```

Update:

```typescript id="j5q8ym"
payment:{
receiptUrl,

submittedAt
}
```

---

# Host Review Flow

Organizer dashboard receives:

Notification:

"New booking request"

---

# Organizer Actions

Two options:

## Approve

or

## Reject

---

# Approval Flow

```text id="h3m7kw"
Host clicks Approve

↓

Cloud Function Trigger

↓

Validate booking

↓

Generate Ticket

↓

Send Email

↓

Notify User
```

---

# Rejection Flow

```text id="f8q4mj"
Host clicks Reject

↓

Update Booking Status

↓

Notify User

↓

Store Reason
```

---

# QR Ticket Generation

Technology:

Cloud Functions Gen2

Flow:

```text id="k2f9zv"
Approved Booking

↓

Generate Unique Ticket ID

↓

Create Secure QR Token

↓

Save Ticket

↓

Generate Email
```

---

# Ticket Document

```text id="p7s1xq"
tickets/{ticketId}
```

Structure:

```typescript id="x6q3mv"
{
ticketId,

eventId,

bookingId,

ownerId,

qrToken,

status:"active",

createdAt
}
```

---

# Email Delivery

Service:

Resend

Email contains:

```text id="w3q2fy"
Event Name

Date

Location

Organizer

QR Code

Instructions
```

---

# User Ticket Wallet

User dashboard:

```text id="w8b9sx"
Upcoming Tickets

↓

Past Tickets

↓

Used Tickets
```

---

# QR Check-In

Event staff scans QR.

Flow:

```text id="v6j2mx"
Scan QR

↓

Cloud Function Validation

↓

Check Ticket Status

↓

Mark Used

↓

Create Check-in Record
```

---

# Check-in Collection

```text id="k9v3hn"
checkins/{checkinId}
```

Stores:

```typescript id="x3p7qd"
{
ticketId,

eventId,

scannerId,

timestamp
}
```

---

# Security Rules

Users can:

Read:

* Own tickets

Cannot:

* Modify ticket status

Only Cloud Functions can:

* Create tickets
* Validate QR
* Mark used

---

# Duplicate Protection

Before generating ticket:

Check:

```text id="m5h2bw"
Does booking already have ticket?
```

If yes:

Return existing ticket.

---

# Capacity Management

Before approval:

Check:

```text id="b4x8nd"
Current attendees

<

Event capacity
```

Prevent overbooking.

---

# Booking Notifications

Attendee receives:

* Booking submitted
* Payment received
* Approved
* Rejected
* Event reminder

---

# Organizer Notifications

Organizer receives:

* New booking
* Payment receipt uploaded
* Capacity warning

---

# Analytics Events

Track:

* Event viewed
* Booking started
* Booking completed
* Payment submitted
* Ticket generated
* Check-in completed

---

# Future Features

Not MVP:

* Online payments
* Multiple ticket tiers
* Discount codes
* Resale marketplace
* Membership passes
* NFC tickets

---

# Final Principle

The booking system is the bridge between discovery and real-world attendance.

Every step should build trust until the attendee receives the QR ticket and feels excited for the event.
