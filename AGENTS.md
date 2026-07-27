<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# EvenTech — Agent Rules

Premium event management SaaS (music industry first). Next.js (App Router) + TypeScript strict + Tailwind v4 + Firebase (Auth/Firestore/Storage/Functions Gen 2) + Resend.

## Read first

1. **`HANDOVER.md`** — current state, locked decisions, infrastructure facts, and the gotchas that have already cost time. Start here in a fresh session.
2. **`guides/50_CANONICAL_DECISIONS.md`** — the single source of truth. It overrides every other guide (and the README) wherever they conflict.
3. **`CLAUDE_TASKS.md`** — standing design brief. Every UI change is refinement, not replacement.
4. `README.md` — reading order for the rest of `guides/` (00–49).
5. **`CLAUDE_TASKS.md`** — standing design brief. Every UI change is **refinement, not replacement**: never rebuild the project, swap the design system, or redesign a page from scratch. Brand identity, IA, navigation, page hierarchy, and the color palette stay fixed; only visual and interaction quality improve. Before implementing any design work, state what will change, why, and which files. After, report improvements, components touched, motion changes, and performance impact.

## Non-negotiable rules

- **i18n: ZERO hardcoded UI strings.** Every user-facing string lives in `messages/en.json` + `messages/ar.json` (key-identical — enforced by `tests/messages.test.ts`). Locales: `en` (default), `ar` (RTL). Use logical CSS properties (`ms-*`/`me-*`, `start`/`end`) — never `ml-*`/`mr-*` for direction-sensitive spacing.

  **i18n enforcement — how and why.** Machine-enforced by [`react/jsx-no-literals`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-literals.md) in `eslint.config.mjs`, scoped to `app/`, `components/`, `features/`. Chosen over `eslint-plugin-i18next` because the rule ships with `eslint-config-next` (zero new dependencies), is well documented, and catches the actual failure mode: visible text sitting in JSX.

  Settings and their reasons:
  - `noStrings: true` — flags any bare text node in JSX. This is the rule's whole point.
  - `ignoreProps: true` — props are mostly non-visible (`className`, `href`, `id`, `data-*`). Flagging them would drown the signal.
  - **Known gap:** because props are ignored, _visible_ string props (`placeholder`, `alt`, `aria-label`, `title`) are not caught. Always pass those through `t()` by hand; reviewers should check them. If this gap ever bites, add `eslint-plugin-i18next` and configure `no-literal-string` with an attribute allowlist.
  - **Vendored files excluded:** `components/ui/**` (shadcn) and the ReactBits files are third-party code we re-generate; our own wrappers around them must still pass. shadcn's few internal strings (e.g. the dialog's sr-only close label) are tracked separately.

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
