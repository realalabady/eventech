# EvenTech — Design Refinement Task

## Context

Before making any changes:

1. Read README.md completely.
2. Read all documentation inside the `guides/` folder (00–50). `guides/50_CANONICAL_DECISIONS.md` outranks every other guide.
3. Review the existing implementation.
4. Understand the current design system before modifying anything.

Do NOT rebuild the project.

Do NOT replace the design system.

Do NOT redesign pages from scratch.

Your goal is refinement, not replacement.

---

# Objective

Transform the current UI from a good modern dashboard into a premium product experience inspired by products such as:

- Luma
- Linear
- Framer
- Raycast
- Apple

This is NOT a request to copy these products.

Instead, extract the design principles that make them feel premium.

The architecture, layout, colors, and components should remain consistent with EvenTech.

Improve craftsmanship rather than changing identity.

---

# Keep Unchanged

Do not modify:

- Brand identity
- Information architecture
- Navigation
- Existing page hierarchy
- Existing components
- Color palette
- Business logic
- Firebase architecture

Only improve visual quality and interaction quality.

---

# Areas to Improve

## 1. Typography

Refine typography across the application.

Improve:

- Font scale
- Line height
- Letter spacing
- Heading hierarchy
- Paragraph spacing
- Visual rhythm

The interface should feel editorial rather than technical.

---

## 2. Whitespace

Increase spacing consistency.

Improve:

- Section spacing
- Card padding
- Vertical rhythm
- Breathing room

Nothing should feel crowded.

Everything should feel intentional.

---

## 3. Motion System

Implement a complete motion language using Framer Motion.

Motion should communicate:

- Progress
- Hierarchy
- Feedback
- Navigation

Never animate for decoration.

---

Required motion includes:

### Page transitions

Smooth page transitions.

### Shared element transitions

Between:

- Event cards
- Organizer cards
- Dashboard widgets

### Scroll reveal

Sections appear progressively.

Use staggered animations.

### Hover interactions

Cards:

- subtle lift
- soft shadow
- slight border emphasis

Buttons:

- scale
- elevation
- smooth color interpolation

Inputs:

- animated focus states

Navigation:

- animated active indicators

Sidebar:

- smooth expansion

Modals:

- scale + fade

Dropdowns:

- fade + slide

Notifications:

floating animated toasts

Loading:

animated skeletons

Progress:

smooth counters

Timeline:

animated progression

Kanban:

animated drag-and-drop transitions

Calendar:

smooth state transitions

---

## 4. Surface Hierarchy

Create multiple visual elevations.

Use:

Background

↓

Section

↓

Card

↓

Interactive Card

↓

Focused Element

↓

Modal

Each layer should feel distinct through:

- subtle shadows
- border treatment
- opacity
- blur
- lighting

Avoid heavy shadows.

---

## 5. Hover States

Every interactive element should have a meaningful hover state.

Examples:

Cards:

- 1–2% scale
- brighter border
- soft shadow
- image movement

Buttons:

- elevation
- subtle movement

Links:

- animated underline
- smooth opacity

Navigation:

- animated selection

---

## 6. Micro Interactions

Every action should provide elegant feedback.

Examples:

Bookmark

Like

Approve booking

Reject booking

Publish event

Open modal

Close modal

Upload image

Save settings

Complete task

Receive notification

Every interaction should feel polished.

---

## 7. Dashboard Experience

The organizer dashboard should feel like a professional production studio.

Improve:

- widget animations
- counters
- timeline
- Kanban transitions
- live activity feed
- calendar animations

The dashboard should feel alive.

---

## 8. Premium Loading Experience

Replace generic loading states with:

- animated skeletons
- progressive loading
- content placeholders
- graceful image loading

---

## 9. Accessibility

Respect:

- prefers-reduced-motion
- keyboard navigation
- focus visibility

Animations should never reduce usability.

---

## 10. Performance

Maintain 60 FPS.

Avoid unnecessary re-renders.

Use GPU-friendly animations.

Animate:

- transform
- opacity

Avoid animating layout whenever possible.

---

# Success Criteria

The project should feel:

- Premium
- Modern
- Elegant
- Calm
- Fast
- Intentional
- Creative

Users should immediately think:

"This feels like Luma or Linear."

without copying either product.

---

# Deliverables

Before implementing:

Explain:

- What will change
- Why it improves the experience
- Which files will be modified

After implementation:

Provide:

- Summary of improvements
- Components updated
- Motion improvements
- Performance considerations

Do not proceed to unrelated tasks.

Focus only on design refinement.
