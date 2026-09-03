# Coding Standards — Keimelion Backoffice

These standards apply to all TypeScript source code in the Backoffice. The Dev agent follows them when implementing; the Lead Dev agent enforces them during code review.

They are shared with the Keimelion API. Rules that only apply on the backend (Drizzle repositories, Hono routes) are omitted here. React/Next-specific rules are appended at the end.

---

## Strict inputs and outputs

### Explicit return types on every function

All functions — exported or private — must declare their return type explicitly. Never rely on inference for function signatures. This includes React components: they return `React.JSX.Element` (or `Promise<React.JSX.Element>` for async server components).

```typescript
// ❌
async function fetchUser(id: string) {
  const response = await apiGet(`/users/${id}`)
  return response
}

// ✅
async function fetchUser(id: string): Promise<ApiUser> {
  const response = await apiGet<ApiUser>(`/users/${id}`)
  return response
}
```

### Avoid optional properties — prefer explicit types

`field?: string` means the field may be completely absent from the object. This is ambiguous: does it mean "not yet set", "not applicable", or "forgotten"? Be explicit instead.

- Use **required fields** on domain types — if a value must exist after creation, it is required
- Use **separate input types** for creation/update where some fields are genuinely optional
- Use **`T | null`** (not `T | undefined`) when a value is intentionally absent — `null` is deliberate, `undefined` is accidental

```typescript
// ❌ — unclear which fields are truly optional vs just not always set
interface Item {
  id: string
  name?: string
  reservedBy?: string
  deletedAt?: Date
}

// ✅ — domain type is fully required; inputs are separate; nullable fields are explicit
interface Item {
  id: string
  name: string
  reservedBy: string | null   // null = not reserved, intentional absence
  deletedAt: Date | null      // null = not deleted
}

interface CreateItemInput {
  name: string                // required to create
  listId: string
}

interface UpdateItemInput {
  name?: string               // optional on update — field may or may not be changed
}
```

### Validate all external inputs with Zod at the boundary

Every input entering the app from outside — form submissions, API responses, URL params, localStorage — must be validated with a Zod schema at the boundary. Downstream code receives already-typed, already-validated data.

```typescript
// ❌ — form values passed straight to a mutation, no runtime check
function LoginForm(): React.JSX.Element {
  const login = useLogin()
  return <form onSubmit={(event) => login.mutate(new FormData(event.currentTarget))} />
}

// ✅ — Zod parses at the boundary, mutation receives clean types
const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase().trim()),
  password: z.string().min(MIN_PASSWORD_LENGTH),
})

type LoginInput = z.infer<typeof loginSchema>

function LoginForm(): React.JSX.Element {
  const login = useLogin()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const parsed = loginSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)))
    if (!parsed.success) return
    login.mutate(parsed.data)
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### `null` over `undefined` for intentional absence

`undefined` means a value was never set. `null` means it was explicitly set to nothing. In domain types, use `null` for intentional absence — it is deliberate and serializes correctly in JSON (`undefined` disappears).

```typescript
// ❌
interface List {
  deletedAt: Date | undefined
}

// ✅
interface List {
  deletedAt: Date | null
}
```

---

## Early return — no `else`

Fail fast. Handle error cases and guard clauses first, then write the happy path without nesting. **`else` is never allowed** — if the `if` block returns, the `else` is redundant; if it doesn't, extract a function.

```typescript
// ❌
function renderList(list: List | null): React.JSX.Element {
  if (list) {
    if (!list.deletedAt) {
      return <ListView list={list} />
    } else {
      return <NotFound />
    }
  } else {
    return <NotFound />
  }
}

// ✅
function renderList(list: List | null): React.JSX.Element {
  if (!list || list.deletedAt) return <NotFound />
  return <ListView list={list} />
}
```

---

## No abbreviations

Use full, descriptive names. Abbreviations save keystrokes but cost clarity.

| ❌ Avoid | ✅ Use |
|---|---|
| `req`, `res` | `request`, `response` |
| `err` | `error` |
| `usr`, `u` | `user` |
| `msg` | `message` |
| `val` | `value` |
| `ctx` | `context` |
| `cb` | `callback` |
| `idx`, `i` | use descriptive loop variable or `.map()` / `.filter()` |
| `e` (in handlers) | `event` |

Exception: well-known, unambiguous domain acronyms (`id`, `url`, `uuid`, `http`, `jsx`) are acceptable.

---

## No comments — self-explaining names

A comment is a sign that the code needs a better name. Rename the function or variable instead of annotating it.

```typescript
// ❌
// Only show the delete button if the user owns the list
if (list.userId === currentUser.id) { ... }

// ✅
function isListOwnedByUser(list: List, userId: string): boolean {
  return list.userId === userId
}
if (isListOwnedByUser(list, currentUser.id)) { ... }
```

The only acceptable comments are:
- Workarounds for external library bugs (with a link to the issue)
- Non-obvious legal or compliance requirements

---

## Minimal parameters

- **Max 3 parameters** for a function. Beyond that, group related params into an object.
- Boolean parameters are a smell — they usually mean the function does two things. Split it.

```typescript
// ❌
function createItem(name: string, listId: string, userId: string, isPublic: boolean, quantity: number) { ... }

// ✅
interface CreateItemInput {
  name: string
  listId: string
  userId: string
  isPublic: boolean
  quantity: number
}
function createItem(input: CreateItemInput) { ... }
```

React components with many props follow the same rule — group into a `ComponentProps` interface (see React/Next addendum below).

---

## Maximum function length: 25 lines

A function body should not exceed 25 lines (excluding the signature and closing brace). If it does, extract sub-functions with descriptive names. This applies to React components too — extract sub-components rather than growing a single component.

---

## Single responsibility

Each function does exactly one thing. The name should describe it completely without "and" or "or".

```typescript
// ❌ — does two things
async function validateAndCreateUser(email: string, password: string) { ... }

// ✅ — each function has one job
async function validateUserInput(email: string, password: string) { ... }
async function createUser(email: string, hashedPassword: string) { ... }
```

---

## `switch/case` over `if/else if` chains

When branching on a single value with 3 or more cases, use `switch/case`. It is more readable and exhaustiveness-checkable by TypeScript.

```typescript
// ❌
function getErrorMessage(code: ErrorCode) {
  if (code === ErrorCode.NOT_FOUND) {
    return 'Resource not found'
  } else if (code === ErrorCode.UNAUTHORIZED) {
    return 'Unauthorized'
  } else if (code === ErrorCode.FORBIDDEN) {
    return 'Forbidden'
  } else {
    return 'Internal server error'
  }
}

// ✅
function getErrorMessage(code: ErrorCode): string {
  switch (code) {
    case ErrorCode.NOT_FOUND:
      return 'Resource not found'
    case ErrorCode.UNAUTHORIZED:
      return 'Unauthorized'
    case ErrorCode.FORBIDDEN:
      return 'Forbidden'
    default:
      return 'Internal server error'
  }
}
```

Combined with TypeScript's exhaustiveness checking: if `default` should never be reached, use `satisfies never` to get a compile error when a case is missing.

---

## Shared enums — no magic strings or numbers

Never use raw string or number literals for values that carry semantic meaning. Define a `const` object with `as const` and derive the type from it.

```typescript
// ❌
if (item.status === 'reserved') { ... }

// ✅ — define once, reuse everywhere
export const ItemStatuses = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  PURCHASED: 'purchased',
} as const

export type ItemStatus = (typeof ItemStatuses)[keyof typeof ItemStatuses]

if (item.status === ItemStatuses.RESERVED) { ... }
```

Enums shared with the API come from `@keimelion/api/shared/enums/*` — never redeclare them locally. See CLAUDE.md → *Type sharing with the API* for the list of safe imports.

---

## No magic numbers or strings — local constants

Any literal that is not immediately obvious from context must be named. Define it as a `const` at the top of the file.

```typescript
// ❌
if (name.length > 50) { ... }
setTimeout(callback, 3000)
if (retries >= 3) { ... }

// ✅
const MAX_NAME_LENGTH = 50
const RETRY_DELAY_MS = 3000
const MAX_RETRIES = 3

if (name.length > MAX_NAME_LENGTH) { ... }
setTimeout(callback, RETRY_DELAY_MS)
if (retries >= MAX_RETRIES) { ... }
```

---

## `const` over `let`, never `var`

Default to `const`. Use `let` only when the variable genuinely needs to be reassigned. If you find yourself reaching for `let`, first ask whether a `.map()` / `.filter()` / ternary would remove the need for mutation.

`var` is never acceptable.

---

## Array methods over `for` loops

Prefer declarative array methods over imperative loops. They express intent, not mechanics.

```typescript
// ❌
const names: string[] = []
for (let i = 0; i < users.length; i++) {
  if (users[i].isActive) {
    names.push(users[i].name)
  }
}

// ✅
const names = users.filter((user) => user.isActive).map((user) => user.name)
```

Use `.map()`, `.filter()`, `.find()`, `.some()`, `.every()`, `.reduce()`. A `for` loop is acceptable only when you need `break` / `continue` semantics that can't be expressed otherwise.

---

## No nested ternaries

A single ternary for a simple inline condition is fine (including inside JSX). Two levels of nesting: extract a function or a sub-component.

```typescript
// ❌
const label = isOwner ? 'owner' : isAdmin ? 'admin' : 'member'

// ✅
function resolveUserLabel(isOwner: boolean, isAdmin: boolean): string {
  if (isOwner) return 'owner'
  if (isAdmin) return 'admin'
  return 'member'
}
```

---

## `async/await` only — no `.then()` / `.catch()`

All async code uses `async/await`. Never chain `.then()` or `.catch()` — it mixes paradigms and makes control flow harder to follow.

```typescript
// ❌
function fetchUser(id: string) {
  return apiGet(`/users/${id}`)
    .then((user) => ({ data: user }))
    .catch((error) => ({ error }))
}

// ✅
async function fetchUser(id: string): Promise<ApiUser> {
  return apiGet<ApiUser>(`/users/${id}`)
}
```

---

## Named exports only — no default exports

Always use named exports. Default exports make refactoring harder (the import name is not enforced) and reduce discoverability.

```typescript
// ❌
export default function UserForm() { ... }

// ✅
export function UserForm(): React.JSX.Element { ... }
```

**Exception**: Next.js App Router requires default exports for `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `template.tsx`, `default.tsx`, and `route.ts` handlers. In those files, use a default export **only** for the route entry point and named exports for everything else in the file (metadata, generateMetadata, etc.).

---

## No `any` in template literals — explicit types only

`@typescript-eslint/restrict-template-expressions` forbids values typed as `any`, `null`, `undefined`, or object types inside template literals. Only `string`, `number`, `boolean`, and `bigint` are allowed directly.

Common triggers:
- Optional env vars typed `string | undefined`
- Properties of objects with `any` index signatures (e.g. untyped external payloads)
- Values that haven't been narrowed yet

Fix by narrowing, converting, or avoiding template literals where possible:

```typescript
// ❌ — string | undefined, any, or object
const message = `Status: ${maybeNull}`
const url = `${process.env.NEXT_PUBLIC_API_URL}/path`  // if undefined at build time

// ✅ — narrow or convert before interpolating
const message = `Status: ${maybeNull ?? 'unknown'}`
const message = `Code: ${String(value)}`

// ✅ — for URLs, prefer the URL constructor
const endpoint = new URL('/users/me', process.env.NEXT_PUBLIC_API_URL).href
```

---

## `??` over `||` for nullish coalescing

Use `??` when you want to fall back only on `null` or `undefined`. `||` also coerces `0`, `""`, and `false` — which is almost never what you want in business logic.

```typescript
// ❌ — falls back when quantity is 0
const quantity = item.quantity || 1

// ✅ — falls back only when quantity is null/undefined
const quantity = item.quantity ?? 1
```

---

## Natural reading order

Functions and components in a file should read top-to-bottom in the order a reader would want to understand them:

1. **The exported component or main function first** — what the module is *for*
2. **Private helpers after** — implementation details, in the order they are called
3. **Sub-components used only here go below the main component** — never above it

A reader opening the file sees the intent at the top and drills into details below.

---

## Naming conventions

- **Functions**: `verb + noun` in camelCase — `getUserById`, `fetchUsers`, `deleteItem`
- **React components**: PascalCase noun — `UserForm`, `UsersTable`, `ListHeader`
- **Custom hooks**: `use` prefix, camelCase — `useUsers`, `useLogin`, `useDeleteUser`
- **Booleans**: `is` / `has` / `can` prefix — `isDeleted`, `hasPermission`, `canEdit`
- **Interfaces**: PascalCase noun — `UserForm`, `CreateListInput`, `ListResult`; component props: `<ComponentName>Props`
- **Constants**: SCREAMING_SNAKE_CASE for true constants — `MAX_ITEMS_PER_LIST`
- **File names**: kebab-case matching the exported symbol — `user-form.tsx` exports `UserForm`, `use-users.ts` exports `useUsers`
- No single-letter variables except in well-understood math contexts

---

## API payload keys — camelCase everywhere

All keys in HTTP request bodies, response bodies, and query params consumed from the Keimelion API are **camelCase**. This matches TypeScript identifiers so the same key flows from `data-access/` → hooks → components without any rename layer.

Form state, TanStack Query cache keys, and local component state also use camelCase. The only place snake_case ever appears is in URL path segments (`/change-password`, `/verify-email`) — that's a REST convention, not a data convention.

---

## Specific error codes — no generic fallbacks

When surfacing an API error to the UI, distinguish specific failure modes from generic ones. `ApiError` responses come with a `code` field (see `@keimelion/api/shared/enums/error-code`) — use it to show a targeted message.

```typescript
// ❌
if (error) return <div>Something went wrong</div>

// ✅
if (error?.code === ErrorCode.INVALID_CREDENTIALS) return <div>Wrong email or password</div>
if (error?.code === ErrorCode.RATE_LIMITED) return <div>Too many attempts — try again in a minute</div>
if (error) return <div>Unexpected error — please retry</div>
```

---

## Trust the validation layer

Components and hooks receive already-validated, already-typed data from Zod parsers or from the API's typed response. Do not re-check constraints downstream.

- If a Zod form schema guarantees `password` is at least 8 chars, do not re-check length inside the mutation
- If the API guarantees `email` is lowercased, do not lowercase it again before display

---

## Normalise inputs at the Zod boundary

Data normalisation (lowercasing emails, trimming whitespace) belongs in the Zod schema via `.transform()` or `.trim()`, not in components or hooks.

```typescript
// ❌ — normalisation scattered in the component
const email = formData.email.toLowerCase().trim()

// ✅ — normalised once at the boundary
const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase().trim()),
})
```

---

## Generic result types — avoid repeated interfaces

Reuse shared types from `@keimelion/api/shared/types/api` (`ApiError`, `PaginatedResponse<T>`) instead of redeclaring them. Only name a new result type when the shape is unique enough to be meaningful on its own.

---

## Avoid overkill interfaces

Do not create an interface for a shape used in exactly one place. Inline the type or pass values directly.

```typescript
// ❌ — interface for a 2-field object used once
interface DeleteUserButtonHandlers {
  onConfirm: () => void
  onCancel: () => void
}

// ✅ — just declare props inline in the component
interface DeleteUserButtonProps {
  onConfirm: () => void
  onCancel: () => void
}
function DeleteUserButton({ onConfirm, onCancel }: DeleteUserButtonProps): React.JSX.Element { ... }
```

---

## Private helpers — ordering within the private section

Within the private section of a file (after all exported functions and components), order helpers in the order they are first called — top to bottom mirrors the call flow.

---

# React / Next.js addendum

The rules below are Backoffice-specific and complement the general TypeScript rules above. Where they conflict with the general rules, these take precedence.

## Server Components by default

Every component in the App Router is a Server Component unless it explicitly opts into client rendering with `'use client'` at the top of the file. Only opt in when you actually need one of:

- Browser-only APIs (`window`, `localStorage`, `IntersectionObserver`)
- React hooks (`useState`, `useEffect`, `useMemo`, custom hooks) — including all TanStack Query hooks
- Event handlers on interactive elements (`onClick`, `onSubmit`, `onChange`)
- Third-party components that themselves use hooks (shadcn/ui interactive primitives, Radix state)

Push the `'use client'` boundary **as low in the tree as possible**. A page can stay a Server Component even if it renders a small interactive island — the island wraps the interactive part, not the whole page.

```tsx
// ✅ — page stays a Server Component; only the form is a client island
// app/(dashboard)/users/page.tsx
import { UsersTable } from '@/features/users/components/users-table'
import { CreateUserButton } from '@/features/users/components/create-user-button'  // 'use client' island

export default async function UsersPage(): Promise<React.JSX.Element> {
  return (
    <>
      <CreateUserButton />
      <UsersTable />
    </>
  )
}
```

## Explicit component return type

Every component declares its return type: `React.JSX.Element` (sync) or `Promise<React.JSX.Element>` (async Server Component). Never rely on inference.

## Props via `interface`, one per component

Component props go in an `interface` named `<ComponentName>Props`, declared just above the component. Never inline the props type or use `type`.

```tsx
// ❌
export function UserRow(props: { user: ApiUser; onEdit: () => void }): React.JSX.Element { ... }

// ✅
interface UserRowProps {
  user: ApiUser
  onEdit: () => void
}

export function UserRow({ user, onEdit }: UserRowProps): React.JSX.Element { ... }
```

## One component per file

The file name matches the exported component in kebab-case. `user-form.tsx` exports `UserForm`. Small purely-presentational sub-components used only inside one parent may stay in the same file, ordered below the parent.

## Hooks prefix and colocation

All custom hooks start with `use` and live under `src/features/<feature>/hooks/`. TanStack Query hooks wrap `data-access/` functions and are the only place `useQuery` / `useMutation` are called — components never call them directly.

```ts
// src/features/users/hooks/use-users.ts
'use client'
import { useQuery } from '@tanstack/react-query'
import { fetchUsers } from '@/data-access/users/users.api'
import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import type { ApiUser } from '@/data-access/users/users.api'

export function useUsers(page: number): ReturnType<typeof useQuery<PaginatedResponse<ApiUser>>> {
  return useQuery({
    queryKey: ['users', page],
    queryFn: () => fetchUsers(page),
  })
}
```

## `data-access/` never touches React

Files under `src/data-access/` export plain async functions that call the Keimelion API through `lib/api-client`. They import no React, no hooks, no TanStack Query. Types returned from these functions are the source of truth for what the UI receives.

## `lib/api-client` is the only place `fetch` is called

Every network call to the Keimelion API goes through `apiGet` / `apiPost` / `apiPatch` / `apiDelete` from `src/lib/api-client.ts`. No raw `fetch` in `data-access/`, no raw `fetch` in components. This centralises auth headers, error normalisation to `ApiError`, and base URL handling.

## Loading, empty, and error states are first-class

Every screen that reads remote data renders three states explicitly — never leave a loading spinner as a fallback for "no data". Use TanStack Query's `isLoading`, `isError`, and `data`; render a dedicated component for each.

```tsx
// ✅
function UsersScreen(): React.JSX.Element {
  const query = useUsers(1)
  if (query.isLoading) return <UsersTableSkeleton />
  if (query.isError) return <UsersErrorState error={query.error} />
  if (query.data.items.length === 0) return <UsersEmptyState />
  return <UsersTable users={query.data.items} />
}
```

## Never render user-controlled HTML

Never pass user-controlled strings to `dangerouslySetInnerHTML`. If rich formatting is required, use a sanitiser (DOMPurify) or render Markdown through a component that escapes by default.

## Env vars: `NEXT_PUBLIC_*` only for browser-safe values

Any variable prefixed `NEXT_PUBLIC_` is inlined into the client bundle at build time and shipped to every visitor. Never put secrets (API keys, tokens) in a `NEXT_PUBLIC_*` var. Server-only secrets go in a non-prefixed var and are read exclusively from Server Components, Server Actions, or route handlers.

## No `useEffect` for data fetching

TanStack Query owns all remote data. `useEffect` is reserved for genuinely imperative browser side-effects (setting up event listeners, syncing to a non-React library). If you find yourself writing `useEffect(() => { fetch(...) }, [])`, replace it with a `useQuery`.

## shadcn/ui components under `components/ui/` are not edited manually

Anything generated by `npx shadcn add` lives under `src/components/ui/` and is treated as generated code — do not edit it in place. If a variant is missing, extend it via a wrapper component in `src/components/shared/` or the feature folder.

## Class strings: use `cn()` — no string concatenation

Combine Tailwind classes through the `cn()` helper from `src/lib/utils.ts` (or wherever shadcn puts it). Never concatenate class strings by hand, never use ternaries that produce class strings directly in JSX.

```tsx
// ❌
<div className={`text-sm ${isActive ? 'font-bold' : ''}`} />

// ✅
<div className={cn('text-sm', isActive && 'font-bold')} />
```

## Accessibility is not optional

Every interactive element has a name, a role, and keyboard support. Buttons are `<button>`, links are `<Link>`, form inputs have a `<label>` linked by `htmlFor`. shadcn/ui primitives handle most of this — the moment you build a custom interactive component, wire up the ARIA attributes yourself.
