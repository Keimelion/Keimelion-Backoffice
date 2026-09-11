import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/features/users/hooks/use-users', () => ({
  useUsers: vi.fn(),
}))

import { useUsers } from '@/features/users/hooks/use-users'
import { UsersPageContent } from './users-page-content'

const PAGINATION = { page: 1, limit: 20, total: 1, totalPages: 1 }

function makeQueryResult(items: ReturnType<typeof makeUser>[]): never {
  return {
    data: { items, pagination: { ...PAGINATION, total: items.length, totalPages: 1 } },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  } as never
}

function makeWrapper(): React.ComponentType<{ children: React.ReactNode }> {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }): React.JSX.Element {
    return (
      <TooltipProvider delayDuration={0}>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </TooltipProvider>
    )
  }
}

function renderContent(): void {
  render(<UsersPageContent />, { wrapper: makeWrapper() })
}

function makeUser(overrides: Partial<{
  id: string
  deletedAt: string | null
  bannedAt: string | null
  role: 'admin' | 'moderator' | 'user'
}> = {}) {
  return {
    id: overrides.id ?? 'u1',
    email: 'user@keimelion.app',
    username: 'testuser',
    authProvider: 'email' as const,
    role: overrides.role ?? ('user' as const),
    avatarUrl: null,
    isCgvAccepted: true,
    cgvAcceptedAt: null,
    isMarketingOptedIn: false,
    emailVerifiedAt: null,
    lastActiveAt: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    bannedAt: overrides.bannedAt ?? null,
    banReason: null,
    deletedAt: overrides.deletedAt ?? null,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

function firstDataRow(): HTMLElement {
  const rows = screen.getAllByRole('row')
  const row = rows[1]
  if (row === undefined) throw new Error('No data row rendered')
  return row
}

describe('UsersPageContent', () => {
  it('renders RoleBadge with correct label for admin', () => {
    vi.mocked(useUsers).mockReturnValue(makeQueryResult([makeUser({ role: 'admin' })]))
    renderContent()
    expect(within(firstDataRow()).getByText('Admin')).toBeInTheDocument()
  })

  it('renders RoleBadge with correct label for moderator', () => {
    vi.mocked(useUsers).mockReturnValue(makeQueryResult([makeUser({ role: 'moderator' })]))
    renderContent()
    expect(within(firstDataRow()).getByText('Moderator')).toBeInTheDocument()
  })

  it('renders UserStatusBadge as Active for a normal user', () => {
    vi.mocked(useUsers).mockReturnValue(makeQueryResult([makeUser()]))
    renderContent()
    expect(within(firstDataRow()).getByText('Active')).toBeInTheDocument()
  })

  it('renders UserStatusBadge as Deleted for a soft-deleted user', () => {
    vi.mocked(useUsers).mockReturnValue(
      makeQueryResult([makeUser({ deletedAt: '2024-06-01T00:00:00.000Z' })]),
    )
    renderContent()
    expect(within(firstDataRow()).getByText('Deleted')).toBeInTheDocument()
  })

  it('renders UserStatusBadge as Banned for a banned user', () => {
    vi.mocked(useUsers).mockReturnValue(
      makeQueryResult([makeUser({ bannedAt: '2024-06-01T00:00:00.000Z' })]),
    )
    renderContent()
    expect(within(firstDataRow()).getByText('Banned')).toBeInTheDocument()
  })

  it('shows empty state message when no users match', () => {
    vi.mocked(useUsers).mockReturnValue(makeQueryResult([]))
    renderContent()
    expect(screen.getByText('No users match these filters.')).toBeInTheDocument()
  })
})
