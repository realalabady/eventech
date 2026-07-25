# 11_COMPONENT_LIBRARY.md

> **EvenTech Component Library**
>
> Version: 1.0

---

# Purpose

This document defines every reusable UI component used across EvenTech.

No page should create its own UI patterns.

Every component must exist inside this library before being used.

---

# Component Philosophy

Components should be

* Reusable
* Accessible
* Animated
* Theme Aware
* Type Safe
* Responsive
* Composable

Every component should solve one problem well.

---

# Component Hierarchy

```text
Foundation

↓

UI

↓

Composite

↓

Feature

↓

Page
```

---

# Component Sources

Priority

1. shadcn/ui

2. 21st.dev

3. ReactBits

4. Custom Components

---

# Foundation Components

## Button

Variants

* Primary
* Secondary
* Outline
* Ghost
* Destructive
* Success
* Icon

States

* Default
* Hover
* Active
* Loading
* Disabled

Animation

* Scale
* Glow
* Ripple (subtle)

---

## Input

Variants

* Text
* Email
* Password
* Search
* Number
* Phone

Features

* Validation
* Icon
* Clear Button
* Loading
* Error
* Success

---

## Textarea

Auto Resize

Character Counter

Validation

---

## Select

Searchable

Grouped

Keyboard Navigation

Virtualized (Future)

---

## Combobox

Autocomplete

Async Search

Keyboard Support

---

## Checkbox

Animated

Accessible

---

## Switch

Spring Animation

Realtime State

---

## Radio Group

Animated Selection

Keyboard Navigation

---

## Slider

Smooth Drag

Touch Support

---

## Badge

Variants

* Success
* Warning
* Error
* Neutral
* Info

---

## Avatar

Supports

Image

Fallback

Status

Presence

---

## Tooltip

Delay

250ms

Smart Positioning

---

## Popover

Animated

Accessible

---

## Dialog

Large

Medium

Small

Fullscreen

---

## Drawer

Desktop

Side Panel

Mobile

Bottom Sheet

---

## Tabs

Animated Indicator

Keyboard Navigation

---

## Accordion

Smooth Height Animation

---

## Skeleton

Cards

Table

Dashboard

Profile

Timeline

---

## Spinner

Only for inline loading.

Never use for full pages.

---

# Layout Components

## Container

Max Width

Responsive

---

## Section

Header

Body

Footer

---

## Grid

Responsive

12 Columns

---

## Stack

Vertical Layout Utility

---

## Split Layout

50 / 50

60 / 40

70 / 30

---

## Sidebar

Collapsible

Animated

Persistent

---

## Top Navigation

Glass Background

Blur

Scroll Aware

---

## Footer

Responsive

---

# Landing Components

Hero

Feature Grid

Logo Cloud

Testimonials

Pricing Cards

FAQ

CTA Banner

Statistics

Timeline

Newsletter

---

# Event Components

## Event Card

Displays

Poster

Title

Venue

Date

Price

Availability

Organizer

Hover Animation

---

## Event Hero

Cover

Gradient Overlay

CTA

Countdown

Quick Info

---

## Ticket Card

QR Preview

Seat

Status

Download

Add to Wallet (Future)

---

## Booking Card

Status

Receipt

Actions

Timeline

---

## Organizer Card

Logo

Followers

Events

Verification

Follow Button

---

## Artist Card

Image

Genre

Upcoming Events

---

## Venue Card

Map

Capacity

Address

Images

---

# Dashboard Components

Workspace Header

Quick Actions

Analytics Cards

Live Activity

Timeline Widget

Kanban Widget

Calendar Widget

Task Widget

Booking Widget

Notification Center

Team Members

Weather Widget (Future)

AI Assistant Widget (Future)

---

# Timeline Components

Timeline Container

Timeline Node

Progress Connector

Milestone Card

Stage Badge

Current Stage Indicator

Completion Animation

---

# Kanban Components

Board

Column

Task Card

Drag Overlay

Priority Badge

Member Avatar

Quick Add

Filter Bar

---

# Calendar Components

Calendar Toolbar

Calendar Event

Agenda Card

Event Tooltip

Mini Calendar

Date Picker

---

# Analytics Components

Stat Card

Line Chart

Area Chart

Bar Chart

Pie Chart

Heat Map

Growth Card

Trend Badge

Realtime Counter

---

# Team Components

Member Card

Invitation Card

Role Badge

Presence Indicator

Activity Card

---

# Messaging Components

Conversation List

Chat Window

Message Bubble

Typing Indicator

Attachment Preview

Emoji Picker (Future)

---

# Branding Components

Theme Selector

Color Picker

Logo Upload

Hero Editor

Gallery Manager

Typography Selector

Preview Window

---

# Notification Components

Toast

Floating Notification

Notification Panel

Notification Badge

Activity Feed Item

---

# Admin Components

User Table

Organization Table

Moderation Queue

Analytics Dashboard

Feature Flag Card

Audit Log Viewer

Support Queue

---

# Empty State Components

Illustration

Title

Description

Primary Action

Secondary Action

---

# Error Components

Error Card

Retry Button

Support Link

Diagnostic Information

---

# Loading Components

Page Skeleton

Table Skeleton

Card Skeleton

Chart Skeleton

Timeline Skeleton

---

# Motion Components

Fade In

Slide In

Scale In

Blur Reveal

Shared Transition

Number Counter

Marquee

Infinite Grid

Gradient Background

Cursor Glow

Mouse Spotlight

Animated Border

Particle Background (Hero Only)

---

# Glass Components

Glass Card

Glass Sidebar

Glass Dialog

Glass Notification

Glass Toolbar

---

# Form Components

Form Section

Step Indicator

Validation Message

Progress Bar

Success Screen

Upload Zone

Receipt Upload

---

# Upload Components

Image Upload

Video Upload

Drag & Drop Zone

Progress Indicator

Preview Gallery

Compression Indicator

---

# Search Components

Global Search

Search Input

Recent Searches

Command Palette

Quick Results

Search Filters

---

# Mobile Components

Bottom Navigation

Floating Action Button

Swipe Card

Pull To Refresh

Bottom Sheet

---

# Accessibility Requirements

Every component must include

* Keyboard Navigation
* Focus Ring
* ARIA Labels
* Screen Reader Support
* Reduced Motion Support
* Proper Contrast

---

# Animation Rules

Hover

≤150ms

Click

≤100ms

Page Transition

≤700ms

Modal

≤250ms

Drawer

≤300ms

Notification

≤250ms

Timeline Progress

Spring Animation

---

# Component Documentation Template

Each component must include

* Purpose
* Props
* Variants
* States
* Accessibility Notes
* Animation Behavior
* Usage Example
* Dependencies

---

# Component Acceptance Criteria

A component is production-ready only if it

✓ Supports Light Mode

✓ Supports Dark Mode

✓ Is Responsive

✓ Is Accessible

✓ Is Animated

✓ Is Fully Typed

✓ Is Reusable

✓ Has Loading State

✓ Has Error State (if applicable)

✓ Has Documentation

---

# Golden Rule

Never build a component for one page.

Build components that solve a design problem once and can be reused everywhere across EvenTech.

A consistent component library is the foundation of a premium product.
