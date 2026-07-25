<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# EvenTech — Agent Rules

Premium event management SaaS (music industry first). Next.js (App Router) + TypeScript strict + Tailwind v4 + Firebase (Auth/Firestore/Storage/Functions Gen 2) + Resend.

## Read first

1. **`guides/50_CANONICAL_DECISIONS.md`** — the single source of truth. It overrides every other guide (and the README) wherever they conflict.
2. `README.md` — reading order for the rest of `guides/` (00–49).

## Non-negotiable rules

- **i18n: ZERO hardcoded UI strings.** Every user-facing string lives in `messages/en.json` + `messages/ar.json` (key-identical — enforced by `tests/messages.test.ts`). Locales: `en` (default), `ar` (RTL). Use logical CSS properties (`ms-*`/`me-*`, `start`/`end`) — never `ml-*`/`mr-*` for direction-sensitive spacing.
- **Design tokens only** — never hardcode colors/spacing/radius/shadows. Tokens live in `app/globals.css`; canonical values in guide 50 §8. Dark is the default theme.
- **Security-sensitive logic runs in Cloud Functions only** (QR, tickets, approvals, roles, emails). Never trust the client.
- **Component sourcing ladder:** shadcn/ui → 21st.dev → ReactBits → custom (last resort).
- **Structure:** feature-first, no `src/`. Features never import each other. Path aliases (`@/...`) only. Components ≤300 lines. Named exports. Files kebab-case.
- **State:** URL → Firestore realtime (source of truth) → local → Zustand (UI state only). Forms: React Hook Form + Zod.
- **Motion:** `motion` package. Durations 100/150/250/400/600, hard cap 700ms. `prefers-reduced-motion` respected.
- **Testing now, not later:** Vitest + React Testing Library + Playwright. Run `pnpm lint && pnpm typecheck && pnpm test` before considering work done.

## Commands

```bash
pnpm dev          # dev server
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest run
pnpm build        # production build
```

## Process (per feature)

Read related guides → check for existing reusable components → explain what/which files → implement current phase only → test → confirm. Never skip build phases (guide 50 §2).
