# 38_AUTHENTICATION_FLOW.md

> **EvenTech Authentication & Identity System**
>
> Version: MVP 1.0

---

# Purpose

Define how users enter, authenticate, and interact with EvenTech based on their role.

Authentication must be:

* Secure
* Fast
* Simple
* Role-aware
* Scalable

---

# Authentication Provider

Primary:

Firebase Authentication

Supported MVP methods:

* Email + Password
* Google OAuth

Future:

* Apple Login
* Phone OTP
* Magic Link

---

# User Journey

```text
Landing Page

↓

Create Account / Login

↓

Firebase Authentication

↓

Create User Profile

↓

Select User Type

↓

Redirect To Workspace
```

---

# User Types

Three account experiences:

```text
Attendee

Organizer

Super Admin
```

---

# Registration Flow

## Step 1

User chooses:

```text
Create Account
```

---

## Step 2

User enters:

```text
Name

Email

Password
```

---

## Step 3

Firebase creates authentication account.

---

## Step 4

Cloud Function creates:

```text
users/{userId}
```

with:

```typescript
{
 uid,
 email,
 role:"attendee",
 accountStatus:"active"
}
```

---

## Step 5

Redirect:

```text
/onboarding
```

---

# Organizer Registration

Organizer selects:

```text
Create Host Account
```

Additional information:

```text
Organization Name

Brand Name

Category

Description

Logo
```

---

Flow:

```text
Create Auth Account

↓

Create User

↓

Create Organization

↓

Assign Owner Role

↓

Open Organizer Dashboard
```

---

# Login Flow

```text
User enters credentials

↓

Firebase Auth

↓

Retrieve User Profile

↓

Check Account Status

↓

Load Permissions

↓

Redirect
```

---

# Role Redirect Rules

```typescript
attendee

→ /discover


organizer

→ /dashboard


admin

→ /admin
```

---

# Permission System

Authentication answers:

"Who are you?"

Authorization answers:

"What can you do?"

---

# Permission Levels

## Attendee

Can:

* Browse events
* Book events
* Manage profile
* View tickets

---

## Organizer

Can:

* Create events
* Manage organization
* Approve bookings
* Manage team
* View analytics

---

## Admin

Can:

* Manage platform
* Review users
* Control organizations
* View system analytics

---

# Session Management

Use Firebase Auth persistence.

Required:

* Secure session restoration
* Automatic token refresh
* Logout everywhere (future)

---

# Protected Routes

Middleware checks:

```text
Authenticated?

↓

Role?

↓

Permission?

↓

Allow Access
```

---

# User Profile Creation

After first login:

Create:

```text
users/{uid}
```

Required fields:

```typescript
{
uid,

email,

displayName,

avatar,

role,

createdAt
}
```

---

# Profile Completion

Users can complete:

```text
Avatar

Username

Bio

Location

Preferences

Social Links
```

---

# Email Verification

Required for:

* Organizer publishing
* Booking approval
* Financial actions

---

# Password Reset

Flow:

```text
Forgot Password

↓

Firebase Email

↓

Reset Password

↓

Login
```

---

# Security Rules

Never trust role from frontend.

Role must come from:

Firebase Custom Claims

*

Firestore verification.

---

# Custom Claims

Example:

```typescript
{
 role:"organizer",

 organizationId:"abc123"
}
```

Created only by Cloud Functions.

---

# Logout

Actions:

```text
Clear Session

↓

Remove Local Cache

↓

Redirect Login
```

---

# Error Handling

Authentication errors must translate into friendly messages.

Examples:

Firebase:

```text
auth/wrong-password
```

Display:

```text
Incorrect email or password
```

---

# Analytics Events

Track:

* Signup completed
* Login completed
* Account created
* Organizer created

---

# Final Principle

Authentication should disappear into the experience.

Users should think about discovering events and creating experiences — not managing accounts.
