# 21_DATABASE_SCHEMA.md

> **EvenTech Firestore Database Schema**
>
> Version: MVP 1.0

---

# Purpose

This document defines the complete Firestore database architecture for EvenTech.

It is the single source of truth for:

* Collections
* Documents
* Relationships
* References
* Indexes
* Ownership
* Security
* Realtime listeners

---

# Database Philosophy

Firestore is optimized for:

* Realtime updates
* Fast reads
* Horizontal scaling
* Denormalized data
* Security by design

Never design Firestore like SQL.

---

# Root Collections

```text
users
organizations
organizationMembers
events
bookings
tickets
artists
venues
tasks
timeline
calendarEvents
notifications
messages
channels
activityLogs
analytics
reviews
favorites
featureFlags
auditLogs
systemSettings
```

---

# Collection: users

Document ID

```text
uid
```

Fields

```ts
{
  uid: string
  email: string
  displayName: string
  username: string
  avatar: string | null
  phone: string | null
  city: string | null
  bio: string | null

  role: "attendee" | "organizer" | "superAdmin"

  emailVerified: boolean

  onboardingCompleted: boolean

  createdAt: Timestamp
  updatedAt: Timestamp
  lastLogin: Timestamp

  preferences: {
    theme: "light" | "dark" | "system"
    language: "en" | "ar"
    notifications: boolean
  }

  stats: {
    bookings: number
    attendedEvents: number
    favoriteEvents: number
  }
}
```

---

# Collection: organizations

```ts
{
  id: string

  ownerId: string

  name: string

  slug: string

  logo: string

  coverImage: string

  description: string

  website: string | null

  iban: string

  verified: boolean

  branding: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    font: string
  }

  social: {
    instagram: string
    x: string
    tiktok: string
    youtube: string
  }

  createdAt: Timestamp

  updatedAt: Timestamp
}
```

---

# Collection: organizationMembers

```ts
{
  id: string

  organizationId: string

  userId: string

  role:
    | "owner"
    | "manager"
    | "staff"
    | "scanner"

  permissions: string[]

  joinedAt: Timestamp
}
```

---

# Collection: events

```ts
{
  id: string

  organizationId: string

  slug: string

  title: string

  description: string

  shortDescription: string

  status:
    | "draft"
    | "planning"
    | "published"
    | "live"
    | "completed"
    | "archived"

  category: "music"

  coverImage: string

  gallery: string[]

  venueId: string

  artists: string[]

  ticketPrice: number

  capacity: number

  availableTickets: number

  soldTickets: number

  startDate: Timestamp

  endDate: Timestamp

  bookingOpen: boolean

  featured: boolean

  visibility: "public" | "private"

  analyticsId: string

  createdBy: string

  createdAt: Timestamp

  updatedAt: Timestamp
}
```

---

# Collection: venues

```ts
{
  id: string

  name: string

  address: string

  city: string

  country: string

  location: GeoPoint

  capacity: number

  images: string[]

  description: string
}
```

---

# Collection: artists

```ts
{
  id: string

  name: string

  image: string

  genres: string[]

  biography: string

  socialLinks: {}

  verified: boolean
}
```

---

# Collection: bookings

```ts
{
  id: string

  eventId: string

  organizationId: string

  attendeeId: string

  receiptUrl: string

  paymentAmount: number

  status:
    | "pending"
    | "approved"
    | "rejected"

  rejectionReason: string | null

  ticketId: string | null

  submittedAt: Timestamp

  reviewedAt: Timestamp | null

  reviewedBy: string | null
}
```

---

# Collection: tickets

```ts
{
  id: string

  bookingId: string

  attendeeId: string

  eventId: string

  qrImage: string

  qrToken: string

  status:
    | "active"
    | "used"
    | "expired"
    | "cancelled"

  checkedInAt: Timestamp | null

  generatedAt: Timestamp
}
```

---

# Collection: tasks

```ts
{
  id: string

  organizationId: string

  eventId: string

  title: string

  description: string

  priority:
    | "low"
    | "medium"
    | "high"
    | "critical"

  status:
    | "todo"
    | "doing"
    | "review"
    | "done"

  assignedTo: string[]

  attachments: string[]

  dueDate: Timestamp

  checklist: []

  createdBy: string

  createdAt: Timestamp
}
```

---

# Collection: timeline

```ts
{
  id: string

  eventId: string

  title: string

  stage: string

  completed: boolean

  completedBy: string | null

  completedAt: Timestamp | null

  dueDate: Timestamp

  dependencies: string[]
}
```

---

# Collection: calendarEvents

```ts
{
  id: string

  organizationId: string

  eventId: string

  title: string

  type:
    | "meeting"
    | "deadline"
    | "booking"
    | "timeline"

  start: Timestamp

  end: Timestamp

  participants: string[]
}
```

---

# Collection: notifications

```ts
{
  id: string

  userId: string

  title: string

  body: string

  type: string

  read: boolean

  actionUrl: string

  createdAt: Timestamp
}
```

---

# Collection: channels

```ts
{
  id: string

  organizationId: string

  name: string

  type:
    | "general"
    | "event"
    | "private"

  members: string[]

  createdAt: Timestamp
}
```

---

# Collection: messages

```ts
{
  id: string

  channelId: string

  senderId: string

  message: string

  attachments: string[]

  createdAt: Timestamp
}
```

---

# Collection: activityLogs

```ts
{
  id: string

  organizationId: string

  actorId: string

  action: string

  resourceType: string

  resourceId: string

  metadata: object

  createdAt: Timestamp
}
```

---

# Collection: analytics

```ts
{
  id: string

  organizationId: string

  eventId: string

  bookings: number

  attendees: number

  revenue: number

  completionRate: number

  updatedAt: Timestamp
}
```

---

# Collection: reviews

```ts
{
  id: string

  attendeeId: string

  eventId: string

  rating: number

  review: string

  createdAt: Timestamp
}
```

---

# Collection: favorites

```ts
{
  id: string

  userId: string

  type:
    | "event"
    | "artist"
    | "organization"

  referenceId: string

  createdAt: Timestamp
}
```

---

# Collection: featureFlags

```ts
{
  id: string

  key: string

  enabled: boolean

  description: string
}
```

---

# Collection: auditLogs

```ts
{
  id: string

  actorId: string

  action: string

  resource: string

  result: "success" | "failure"

  ip: string

  createdAt: Timestamp
}
```

---

# Collection: systemSettings

```ts
{
  maintenanceMode: boolean

  platformName: string

  supportEmail: string

  version: string
}
```

---

# Relationships

```text
User
 ├── owns → Organization
 ├── creates → Booking
 ├── owns → Ticket
 ├── writes → Review
 └── receives → Notification

Organization
 ├── has → Members
 ├── creates → Events
 ├── owns → Tasks
 ├── owns → Calendar
 └── owns → Analytics

Event
 ├── has → Bookings
 ├── has → Tickets
 ├── has → Timeline
 ├── has → Tasks
 ├── has → Artists
 └── belongs → Organization
```

---

# Firestore Best Practices

* Keep documents under 1 MB.
* Prefer denormalization over joins.
* Avoid deeply nested objects.
* Use document references only when necessary.
* Store computed analytics separately.
* Batch writes when updating multiple documents.
* Use transactions for inventory-like operations (e.g., decrementing available tickets).

---

# Naming Conventions

Collections

* camelCase

Document IDs

* Firestore auto-ID (except `users/{uid}`)

Timestamp Fields

* `createdAt`
* `updatedAt`

Reference Fields

* `<resource>Id`

Boolean Fields

* Prefix with `is`, `has`, or use clear adjectives (e.g., `verified`, `featured`).

---

# Database Design Principles

1. Optimize for reads.
2. Design for realtime updates.
3. Minimize Cloud Function reads.
4. Keep security rules simple.
5. Never expose sensitive business logic to the client.
6. Treat Firestore as the source of truth for application state.

---

# Final Rule

Every collection should have a clear owner, clear permissions, and a well-defined lifecycle.

If a document's ownership or access rules are ambiguous, redesign the schema before implementation.
