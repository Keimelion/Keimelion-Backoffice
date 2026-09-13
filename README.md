# Keimelion Backoffice

**The admin backoffice for [Keimelion](https://keimelion.com)** — collaborative wishlists.

![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.x-FF4154?logo=reactquery&logoColor=white)

---

## Getting started

> Prerequisites:
> - **Node.js v20+**
> - The [Keimelion API](https://github.com/Keimelion/Keimelion-API) cloned **as a sibling directory** — TypeScript path aliases resolve to `../Keimelion-API/src/*` for shared enum and type imports.
> - The API running locally (see its README).

```bash
# Expected layout: both repos side-by-side
# <parent>/
#   ├── Keimelion-API/
#   └── Keimelion-Backoffice/  ← you are here

npm install
cp .env.example .env.local
npm run dev
```

The backoffice is available at **http://localhost:3001** (the API uses 3000).

### Adding UI components

shadcn/ui is already initialized with a **Stone** base. To add a new component:

```bash
npx shadcn add <component-name>
# example: npx shadcn add table dialog toast
```

---

## Stack

| Layer | Tech |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) — App Router, React Server Components |
| UI | [shadcn/ui](https://ui.shadcn.com) — Radix primitives + Tailwind |
| Icons | [lucide-react](https://lucide.dev) |
| Theme | [next-themes](https://github.com/pacocoursey/next-themes) — light / dark / system |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Font | [Inter](https://fonts.google.com/specimen/Inter) via `next/font` |
| HTTP client | [axios](https://axios-http.com) — shared instance with auth + `Accept-Language` interceptors |
| Data fetching | [TanStack Query v5](https://tanstack.com/query) |
| Client state | [Zustand](https://zustand-demo.pmnd.rs) — locale store |
| Validation | [Zod](https://zod.dev) |
| Tests | [Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com/react) — jsdom |

---

## Design system

Design tokens live in **`src/styles/_tokens.scss`** as the single source of truth — brand palette, neutral scale (stone), semantic maps for light + dark modes, and notification variant colors. `src/styles/theme.scss` reads those maps and emits `:root {}` + `.dark {}` CSS custom properties, which Tailwind consumes via `@theme inline` in `src/app/globals.css`. Component SCSS files (`sonner.scss`, etc.) `@use` the partial to reference the same SCSS values (e.g. `$variants` map for toast colors) — one place to change a color, everything downstream stays in sync.

### Brand palette (Refreshing Summer Fun)

| Token | Hex | Usage |
|---|---|---|
| `brand-navy` | `#023047` | Deep accent — used as `--primary-foreground` |
| `brand-amber` | `#ffb703` | **Primary** — buttons, active states, focus rings |

The full 5-color palette (adding `brand-sky #8ecae6`, `brand-teal #219ebc`, `brand-tiger #fb8500`) is available in the design system doc — re-expose as CSS vars + `@theme inline` when a use case appears.

Use semantic tokens for interactive elements — `bg-primary`, `text-primary-foreground`, `border-border`, `bg-destructive`, etc. — and the raw brand tokens (`bg-brand-amber`, `text-brand-navy`) for one-off accents.

### Dark mode

Toggle in the topbar swaps light ↔ dark via the [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) (cross-fade) with a CSS fallback for Firefox. Default is `system`.

### Internationalization

Locale picker in the topbar (🇫🇷 Français / 🇬🇧 English). Selection is persisted to `localStorage['keimelion.locale']` and exposed via a Zustand store consumed both by React components and by the shared axios instance, which attaches `Accept-Language: <locale>` to every outbound request. TanStack Query keys include the locale so switching languages triggers automatic refetches. Initial locale resolves from storage first, then `navigator.language`, falling back to `en`. Supported locales are defined once in the API (`@keimelion/api/shared/enums/locale`) and re-exported from `src/lib/i18n/locale.ts`.

---

## Project structure

```
src/
├── app/                    # Next.js App Router — pages and layouts only
│   ├── (auth)/             # Route group: unauthenticated pages (login, register, reset-password)
│   └── (dashboard)/        # Route group: authenticated pages with sidebar
├── components/
│   ├── ui/                 # shadcn/ui generated components (do not edit)
│   └── shared/             # sidebar, user-menu, theme-toggle, locale-picker, page-header, data-table…
├── data-access/            # All API calls — mirrors db/ in the API
│   ├── _shared/            # Shared infra (the `_` prefix marks non-resource helpers)
│   │   ├── axios/          # Shared axios instance — auth bearer + Accept-Language interceptors, 401 refresh retry
│   │   ├── auth-storage/   # Access token, refresh token, current user, session cookie
│   │   ├── api-error.ts    # ApiRequestError class thrown by the axios response interceptor
│   │   ├── parse-response/ # Zod-validated response parser
│   │   ├── query-params/   # buildListSearchParams — pagination + filter serialization
│   │   └── user.ts         # Shared ApiUser type (mirrors API BaseUser with string dates)
│   ├── auth/               # loginApi, logoutApi, registerApi, refresh
│   ├── occasion-types/     # fetchOccasionTypes
│   └── users/              # fetchUsers, fetchUser, updateUser, deleteUser
├── features/               # Feature modules — TanStack Query hooks + feature-specific components
│   ├── auth/
│   ├── occasion-types/
│   └── users/
├── lib/
│   ├── i18n/               # Locale primitives, resolver, Zustand store (see Internationalization above)
│   ├── query-client.ts     # TanStack Query client + global mutation error toast
│   ├── notify.ts           # Shared toast helpers (success / error / info)
│   ├── format-date.ts      # Locale-aware date formatting
│   └── utils.ts            # cn() — class-merge helper for shadcn components
├── middleware.ts           # Edge middleware entry (Next.js requires this path); composes helpers from middlewares/
├── middlewares/            # Individual middleware helpers (require-session.ts, …) — each returns NextResponse | null
├── styles/                 # Design tokens (SCSS) → CSS custom properties consumed by Tailwind
└── test/                   # Vitest setup + shared testing utilities (query-test-utils, …)
```

### data-access/ vs features/

`data-access/` holds plain async functions that call the API — no React, no TanStack Query. It is the frontend equivalent of `db/entities/` in the API.

`features/` wraps those functions with TanStack Query hooks (`useQuery`, `useMutation`) and owns feature-specific components.

---

## Type sharing with the API

Types are shared directly from the API source via `tsconfig.json` path aliases — no build step or publish required.

```ts
import type { AuthProvider } from '@keimelion/api/shared/enums/auth-provider'
import type { UserRole } from '@keimelion/api/shared/enums/user-role'
import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
```

Only import files with no Drizzle ORM dependencies (enums, `shared/types/api`). `ApiUser` is defined locally in `data-access/auth/auth.api.ts` with string dates to accurately match the JSON response.

---

## Commands

```bash
npm run dev         # Development server (hot reload, port 3001)
npm run build       # Production build
npm run start       # Start production server
npm run lint        # ESLint
npm run format      # Prettier
npm test            # Vitest — single pass
npm run test:watch  # Vitest — watch mode
```

---

## Commit convention

Every commit — and every PR title — follows this pattern:

```
<type>: <identifier> <short description> (<TICKET-ID>)
```

- `<type>` — [Conventional Commits](https://www.conventionalcommits.org/) type: `feat` / `fix` / `refactor` / `chore` / `docs` / `perf` / `test` / `style` / `build` / `ci`. **No scope in parens.**
- `<identifier>` — the primary thing the commit touches. Pick the most specific form:
  - Route path for page work: `/login`, `/users`, `/occasion-types`
  - Component or feature name when no dedicated route: `LoginForm`, `Sidebar`, `LocalePicker`
  - Folder or module path for infra work, prefixed with `_` when it lives under a `_shared` folder: `_i18n`, `_client`, `_auth-storage`, `styles/tokens`
- `<short description>` — plain sentence, no period, no filler words
- `<TICKET-ID>` — always at the end in parens: `(KEI-N)`

Examples (from the git log):

```
feat: /login wire login form + client-side auth guard (KEI-41)
feat: /occasion-types wire non-paginated list page (KEI-57)
refactor: _client switch fetch wrapper to axios (KEI-56)
feat: _auth-storage silent refresh token rotation (KEI-42)
feat: _i18n send Accept-Language + user language picker (KEI-59)
```

Follow-up commits inside the same PR keep the parent identifier:

```
fix: _i18n hide active locale from picker dropdown (KEI-59)
```

| Type | Usage |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change with no behavior change |
| `chore` | Maintenance, dependencies, config |
| `docs` | Documentation only |
| `perf` | Performance improvement |
| `test` | Adding or updating tests only |
| `style` | Formatting / whitespace only |
| `build` | Build system, dependencies |
| `ci` | CI/CD |
