# 08_FIRESTORE_DATABASE.md

> **EvenTech Firestore Database Specification**
>
> Version: 1.0

---

# Purpose

This document defines the Firestore data model for EvenTech.

The schema is designed around scalability, multi-tenancy, realtime synchronization, and future expansion.

Every document must be strongly typed.

Every document must include metadata.

---

# Database Philosophy

Firestore is not a relational database.

Design principles:

* Denormalize when appropriate
* Optimize for reads
* Keep documents small
* Prefer subcollections for high-volume data
* Never exceed Firestore document size limits
* Use realtime listeners where beneficial

---

# Root Collections

```text
users
organizations
events
bookings
tickets
artists
venues
notifications
activities
messages
invites
media
reviews
categories
tags
system
featureFlags
auditLogs
```

---

# Common Metadata

Every document must include:

```ts
id: string

createdAt: Timestamp

updatedAt: Timestamp

createdBy: string

updatedBy: string

deleted: boolean

version: number
```

---

# users

```ts
users/{userId}

id

role

displayName

username

email

phone

avatar

bio

country

city

language

theme

verified

organizationIds[]

favoriteEvents[]

favoriteOrganizers[]

socialLinks{}

preferences{}

notificationSettings{}

stats{}

createdAt

updatedAt
```

---

# organizations

Represents every organizer.

```ts
organizations/{organizationId}

id

name

slug

logo

coverImage

description

website

email

phone

iban

verified

ownerId

membersCount

eventCount

branding{}

theme{}

seo{}

socialLinks{}

settings{}

analytics{}

createdAt

updatedAt
```

---

# Organization Subcollections

```text
members

roles

activity

tasks

calendar

kanban

files

messages

analytics

settings
```

---

# members

```ts
organizations/{id}/members/{memberId}

userId

role

permissions[]

status

joinedAt

lastSeen
```

---

# events

```ts
events/{eventId}

id

organizationId

title

slug

description

status

visibility

category

genre

coverImage

gallery[]

venueId

artistIds[]

startDate

endDate

capacity

remainingTickets

published

featured

ticketSales

checkInCount

tags[]

workflowStage

branding{}

seo{}

settings{}

analytics{}

createdAt

updatedAt
```

---

# Event Status

```text
draft

planning

scheduled

published

selling

live

completed

archived

cancelled
```

---

# Event Subcollections

```text
timeline

tasks

kanban

calendar

bookings

tickets

checkins

activity

messages

media

files

reviews
```

---

# timeline

```ts
events/{id}/timeline/{timelineId}

title

description

status

order

startDate

endDate

completed

completedBy

completedAt
```

---

# tasks

```ts
events/{id}/tasks/{taskId}

title

description

assigneeId

priority

status

labels[]

attachments[]

dueDate

commentsCount

activityCount
```

---

# Kanban

```ts
events/{id}/kanban/{cardId}

title

column

order

priority

labels[]

members[]

dueDate
```

---

# bookings

```ts
bookings/{bookingId}

eventId

organizationId

userId

ticketTypeId

status

receiptImage

receiptAmount

receiptDate

note

reviewedBy

reviewedAt

approvedAt

rejectedAt

ticketId

createdAt
```

---

# Booking Status

```text
pending

approved

rejected

cancelled

expired
```

---

# tickets

```ts
tickets/{ticketId}

bookingId

eventId

organizationId

userId

qrCode

ticketNumber

status

checkedIn

checkedInAt

checkedInBy

emailSent

walletEnabled

createdAt
```

---

# Ticket Status

```text
active

used

cancelled

expired
```

---

# checkins

```ts
events/{id}/checkins/{checkinId}

ticketId

userId

scannerId

time

device

location
```

---

# artists

```ts
artists/{artistId}

name

slug

bio

image

genres[]

socialLinks{}

verified

organizationIds[]

upcomingEvents[]
```

---

# venues

```ts
venues/{venueId}

name

slug

address

city

country

coordinates

capacity

images[]

amenities[]

contact{}
```

---

# media

```ts
media/{mediaId}

organizationId

eventId

type

url

thumbnail

size

mimeType

uploadedBy

createdAt
```

---

# notifications

```ts
notifications/{notificationId}

userId

title

message

type

icon

action

read

createdAt
```

---

# activities

Global activity stream.

```ts
activities/{activityId}

organizationId

eventId

userId

type

title

description

metadata{}

createdAt
```

---

# messages

```ts
messages/{messageId}

organizationId

channelId

senderId

message

attachments[]

mentions[]

edited

createdAt
```

---

# invites

```ts
invites/{inviteId}

organizationId

email

role

token

expiresAt

accepted

createdAt
```

---

# reviews

```ts
reviews/{reviewId}

eventId

userId

rating

comment

createdAt
```

---

# featureFlags

```ts
featureFlags/{flagId}

name

enabled

description

rollout
```

---

# auditLogs

```ts
auditLogs/{logId}

actorId

organizationId

action

resource

resourceId

metadata{}

timestamp
```

---

# Relationships

```text
User
│
├── Bookings
├── Tickets
├── Notifications
└── Organizations

Organization
│
├── Members
├── Events
├── Tasks
├── Analytics
└── Branding

Event
│
├── Timeline
├── Tasks
├── Tickets
├── Bookings
├── Media
├── Check-ins
└── Activity
```

---

# Firestore Indexes

Composite indexes required for:

* Events by status + date
* Events by organization + status
* Bookings by event + status
* Bookings by user + status
* Tickets by event
* Activities by event + createdAt
* Notifications by user + read
* Tasks by assignee + status
* Timeline by event + order

---

# Realtime Collections

Use Firestore listeners for:

* Notifications
* Timeline
* Tasks
* Kanban
* Bookings
* Activity Feed
* Calendar
* Messages
* Check-ins
* Dashboard Metrics

---

# Soft Delete Policy

Documents are **never permanently deleted** from the client.

Instead:

```ts
deleted = true
deletedAt = Timestamp
deletedBy = userId
```

Scheduled Cloud Functions may permanently remove archived data after the retention period.

---

# Naming Rules

Collections:

* plural
* lowercase
* camelCase only when necessary

Fields:

* camelCase
* descriptive
* never abbreviated

Examples:

```text
startDate ✅

eventStartDate ❌

createdAt ✅

crt_at ❌
```

---

# Document Size Rules

Maximum target document size:

* < 100 KB preferred
* Never approach Firestore's 1 MB limit

Large datasets must move into subcollections.

---

# Database Principles

* Every document has an owner.
* Every event belongs to one organization.
* Every booking belongs to one event.
* Every ticket belongs to one booking.
* Every activity is immutable.
* Every notification is user-specific.
* Every write is validated by Cloud Functions.
* Every collection is protected by Firestore Security Rules.

This schema is the foundation for all backend services and is designed to support millions of users while maintaining realtime performance and clean data ownership.
