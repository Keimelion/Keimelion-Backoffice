# Keimelion Backoffice

**The admin backoffice for [Keimelion](https://keimelion.com)** — collaborative wishlists.

![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.x-FF4154?logo=reactquery&logoColor=white)

---

## Getting started

> Prerequisites: **Node.js v20+** and a running [Keimelion API](../Keimelion-API/README.md)

```bash
# Install dependencies (from the workspace root)
cd ..
npm install

# Copy environment variables
cd Keimelion-Backoffice
cp .env.example .env.local

# Start the dev server
npm run dev
```

The backoffice is available at **http://localhost:3001**.

### Add UI components (first time only)

```bash
npx shadcn init
```

---

## Stack

| Layer | Tech |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) — App Router, React Server Components |
| UI | [shadcn/ui](https://ui.shadcn.com) — Radix primitives + Tailwind |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Data fetching | [TanStack Query v5](https://tanstack.com/query) |
| Validation | [Zod](https://zod.dev) |

---

## Project structure

```
src/
├── app/                    # Next.js App Router — pages and layouts only
│   ├── (auth)/             # Route group: unauthenticated pages (login…)
│   └── (dashboard)/        # Route group: authenticated pages with sidebar
├── components/
│   ├── ui/                 # shadcn/ui generated components (do not edit)
│   └── shared/             # Reusable app-level components (sidebar, data-table…)
├── data-access/            # All API calls — one folder per resource
│   ├── auth/               # loginApi, logoutApi, registerApi
│   └── users/              # fetchUsers, fetchUser, updateUser, deleteUser
├── features/               # Feature modules (hooks + feature-specific components)
│   ├── auth/
│   └── users/
└── lib/
    ├── api-client.ts       # Typed fetch wrapper (apiGet, apiPost, apiPatch, apiDelete)
    └── query-client.ts     # TanStack Query client configuration
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
npm run dev       # Development server (hot reload)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint
npm run format    # Prettier
```

---

## Commit convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) — same convention as the API.

```
<type>(<scope>): <message>

feat(users): add user detail page
fix(auth): handle expired token redirect
chore: update dependencies
```

| Type | Usage |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change with no behavior change |
| `chore` | Maintenance, dependencies, config |
| `docs` | Documentation only |
| `perf` | Performance improvement |
| `ci` | CI/CD |
