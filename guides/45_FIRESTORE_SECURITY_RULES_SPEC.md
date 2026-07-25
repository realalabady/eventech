# 45_FIRESTORE_SECURITY_RULES_SPEC.md

> **EvenTech Firestore Security Architecture**
>
> Version: MVP 1.0

---

# Purpose

Define the security model protecting EvenTech data.

Security principle:

Never trust the client.

Every request must be verified.

---

# Security Layers

```text
User Authentication

↓

Custom Claims

↓

Firestore Rules

↓

Cloud Functions Validation

↓

Database Operation
```

---

# Authentication Requirement

Default:

```javascript
request.auth != null
```

No anonymous access for private data.

---

# User Data Rules

Collection:

```text
users/{userId}
```

---

# Read Permission

Allowed:

User can read own profile.

```text
request.auth.uid == userId
```

---

# Update Permission

Allowed:

User can update:

* Name
* Avatar
* Preferences

Forbidden:

* Role
* Permissions
* Account status

---

# User Role Protection

Never allow:

```text
client update role
```

Only:

Cloud Functions.

---

# Organization Rules

Collection:

```text
organizations/{organizationId}
```

---

# Public Read

Allowed:

Verified organizations.

---

# Private Access

Allowed:

Owner.

Team members with permission.

---

# Organization Update

Allowed:

Owner.

Managers with:

```text
manage_profile
```

permission.

---

# Event Rules

Collection:

```text
events/{eventId}
```

---

# Public Read

Allowed:

Only:

```text
status == published
```

---

# Create Event

Required:

Authenticated user.

Must have:

```text
role == organizer
```

---

# Update Event

Allowed:

Organizer owner.

Team members with permissions.

---

# Delete Event

Not allowed directly.

Use:

Cloud Function.

Reason:

Need audit logs.

---

# Booking Rules

Collection:

```text
bookings/{bookingId}
```

---

# Create Booking

Allowed:

Authenticated attendees.

---

# Update Booking

Forbidden:

Direct client update.

Reason:

Prevent fake approvals.

---

# Booking Approval

Only:

Cloud Function.

---

# Receipt Upload

Allowed:

Booking owner.

---

# Ticket Rules

Collection:

```text
tickets/{ticketId}
```

---

# Read

Allowed:

Ticket owner.

Organizer of event.

Check-in staff.

---

# Write

Forbidden.

Only:

Cloud Functions.

---

# Notification Rules

Collection:

```text
notifications/{notificationId}
```

---

# Read

Only notification owner.

---

# Update

Allowed:

Mark as read.

---

# Tasks Rules

Collection:

```text
tasks/{taskId}
```

---

# Read

Allowed:

Organization members.

---

# Create

Allowed:

Users with:

```text
create_task
```

permission.

---

# Update

Allowed:

Assigned member.

Managers.

---

# Messages Rules

Collection:

```text
conversations/{conversationId}
```

---

# Read

Only participants.

---

# Write

Only participants.

---

# Admin Rules

All admin actions require:

```text
request.auth.token.admin == true
```

---

# Sensitive Operations

Require Cloud Functions:

* Role changes
* User suspension
* Organizer verification
* Ticket generation
* Payment approval

---

# Storage Security

Protected folders:

```text
/users

/organizations

/events

/receipts
```

---

# Upload Rules

Validate:

* User authentication
* File size
* File type
* Ownership

---

# Receipt Security

Receipts are private.

Allowed:

* Attendee owner
* Organizer reviewing booking

---

# Rate Limiting

Future:

Protect:

* Booking creation
* Uploads
* Login attempts

---

# Data Validation

Every write validates:

Required fields.

Correct data types.

Allowed values.

---

# Audit Requirement

Sensitive actions create:

```text
activityLogs
```

Examples:

* Booking approved
* Role changed
* User suspended

---

# Security Testing Checklist

Before production:

✓ Test unauthorized access

✓ Test role escalation

✓ Test document ownership

✓ Test deleted users

✓ Test fake requests

✓ Test storage access

---

# Final Principle

Security is not a feature added later.

Security is the foundation that allows EvenTech to become a trusted event platform.

Every user action must be verified, every permission must be intentional, and every sensitive operation must be controlled.
