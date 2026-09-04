# Keimelion Backoffice — Claude context

## Project

Backoffice admin for Keimelion, a collaborative wishlist app. Built with Next.js (App Router) and TypeScript, consuming the Keimelion REST API.

## Stack

- **Framework**: Next.js 15 (App Router, RSC)
- **Language**: TypeScript strict
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Data fetching**: TanStack Query v5
- **Tests**: Vitest + React Testing Library (jsdom env, `src/test/setup.ts`)
- **Linting**: ESLint with `typescript-eslint` strict + stylistic type-checked
- **Formatting**: Prettier (same config as API)

## Coding standards

See `.claude/coding-standards.md` for the full standards. They are derived from the API's rules (universal TypeScript patterns) with a React/Next addendum at the end that is Backoffice-specific.

Summary of rules that matter most in this codebase:
- **Named exports only** — no default exports (except Next.js page/layout components, which require default exports)
- **Explicit return types** on every function, including React components (`React.JSX.Element`)
- **No `else`** — early return pattern everywhere
- **`null` over `undefined`** for intentional absence
- **No abbreviations** — `error` not `err`, `response` not `res`
- **No comments** — rename instead of annotate
- **No magic numbers/strings** — extract to `const`
- **`const` over `let`**, never `var`
- **`async/await` only** — no `.then()` / `.catch()`
- **`??` over `||`** for nullish coalescing

### React/Next.js additions

- **Server Components by default** — add `'use client'` only when needed (event handlers, hooks, browser APIs)
- **`React.JSX.Element` return type** on all components
- **Props as interface** — `interface ComponentProps { ... }`, not inline type or `type`
- **One component per file** — file name matches component name in kebab-case (`user-form.tsx` exports `UserForm`)
- **Hooks prefix** — all custom hooks start with `use` (`useUsers`, `useLogin`)

## Project structure

```
src/
  app/                  # Next.js App Router — pages and layouts only, no business logic
    (auth)/             # Route group: login/register, no sidebar
    (dashboard)/        # Route group: authenticated pages with sidebar
  components/
    ui/                 # shadcn/ui generated components — do not edit manually
    shared/             # Reusable app-level components (sidebar, page-header, data-table…)
  data-access/          # All API calls — mirrors db/entities/ in the API
    auth/
      auth.api.ts       # loginApi(), logoutApi(), registerApi()
    users/
      users.api.ts      # fetchUsers(), fetchUser(), updateUser(), deleteUser()
  features/             # Feature logic: TanStack Query hooks + feature-specific components
    auth/
      components/       # LoginForm, etc.
      hooks/            # useLogin, useLogout
    users/
      components/       # UsersTable, UserForm, etc.
      hooks/            # useUsers, useUser, useUpdateUser, useDeleteUser
  lib/
    api-client.ts       # Typed fetch wrapper (apiGet, apiPost, apiPatch, apiDelete)
    query-client.ts     # TanStack Query client configuration
  types/                # Local-only types (nav items, UI state…)
```

### data-access/ layer

`data-access/` is the direct equivalent of `db/entities/` in the API:
- Each file exports plain async functions that call the API — no TanStack Query, no hooks
- Functions return the raw API response type (`Promise<PaginatedResponse<ApiUser>>`, etc.)
- All API call logic lives here; features never call `fetch` or `api-client` directly

### features/ layer

- **Hooks** wrap `data-access/` functions with TanStack Query (`useQuery`, `useMutation`)
- **Components** are feature-specific and import from hooks, never from `data-access/` directly

## Type sharing with the API

Types are shared via `tsconfig.json` path aliases:

```ts
import type { AuthProvider } from '@keimelion/api/shared/enums/auth-provider'
import type { UserRole } from '@keimelion/api/shared/enums/user-role'
import type { PaginatedResponse, ApiError } from '@keimelion/api/shared/types/api'
```

**Repo layout requirement**: the alias resolves to `../Keimelion-API/src/*`, so both repos must be cloned side-by-side in the same parent directory for `tsc` and Vitest to work:

```
<parent>/
  Keimelion-API/
  Keimelion-Backoffice/
```

If you clone the Backoffice alone, type-checking will fail on any `@keimelion/api/*` import. Clone the API alongside before running `npm install`.

**Safe to import from the API** (no Drizzle/ORM dependencies):
- `@keimelion/api/shared/enums/*`
- `@keimelion/api/shared/types/api` (`ApiError`, `PaginatedResponse`)

**Do not import** — these pull in Drizzle ORM types which don't exist in the backoffice:
- `@keimelion/api/shared/types/user` (references DB schema)
- `@keimelion/api/features/*/mapper` (references DB schema)
- `@keimelion/api/db/**`

`ApiUser` is defined in `src/data-access/auth/auth.api.ts` and mirrors `BaseUser` with string dates (accurate JSON representation).

## Commands

```bash
npm run dev        # Start dev server (port 3001 — the API uses 3000)
npm run build      # Production build
npm run lint       # ESLint
npm run format     # Prettier
npm test           # Vitest single-pass
npm run test:watch # Vitest watch mode
```

## Environment

`NEXT_PUBLIC_API_URL` — base URL of the Keimelion API (e.g. `http://localhost:3000`). Required.
