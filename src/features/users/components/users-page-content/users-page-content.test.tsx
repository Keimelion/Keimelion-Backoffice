import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mockUseQueryResult, renderWithQueryClient } from '@/test/test-utils'
import { TooltipProvider } from '@/components/ui/tooltip'

const replaceMock = vi.fn()
const useSearchParamsMock = vi.fn(() => new URLSearchParams())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => useSearchParamsMock(),
}))

vi.mock('@/features/users/hooks/use-users', () => ({
  useUsers: vi.fn(),
}))

import { useUsers } from '@/features/users/hooks/use-users'
import { UsersPageContent } from './users-page-content'

const PAGINATION = { page: 1, limit: 20, total: 1, totalPages: 1 }

interface UsersData {
  items: ReturnType<typeof makeUser>[]
  pagination: typeof PAGINATION
}

function makeUsersData(items: ReturnType<typeof makeUser>[]): UsersData {
  return {
    items,
    pagination: { ...PAGINATION, total: items.length, totalPages: 1 },
  }
}

function renderContent(): void {
  renderWithQueryClient(
    <TooltipProvider delayDuration={0}>
      <UsersPageContent />
    </TooltipProvider>,
  )
}

function makeUser(overrides: Partial<{
  id: string
  email: string
  username: string | null
  deletedAt: string | null
  bannedAt: string | null
  role: 'admin' | 'moderator' | 'user'
}> = {}) {
  return {
    id: overrides.id ?? 'u1',
    email: overrides.email ?? 'user@keimelion.app',
    username: overrides.username === undefined ? 'testuser' : overrides.username,
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
  useSearchParamsMock.mockReturnValue(new URLSearchParams())
})

function firstDataRow(): HTMLElement {
  const rows = screen.getAllByRole('row')
  const row = rows[1]
  if (row === undefined) throw new Error('No data row rendered')
  return row
}

describe('UsersPageContent', () => {
  it('renders RoleBadge with correct label for admin', () => {
    vi.mocked(useUsers).mockReturnValue(
      mockUseQueryResult<UsersData>({ data: makeUsersData([makeUser({ role: 'admin' })]) }),
    )
    renderContent()
    expect(within(firstDataRow()).getByText('Admin')).toBeInTheDocument()
  })

  it('renders RoleBadge with correct label for moderator', () => {
    vi.mocked(useUsers).mockReturnValue(
      mockUseQueryResult<UsersData>({ data: makeUsersData([makeUser({ role: 'moderator' })]) }),
    )
    renderContent()
    expect(within(firstDataRow()).getByText('Moderator')).toBeInTheDocument()
  })

  it('renders UserStatusBadge as Active for a normal user', () => {
    vi.mocked(useUsers).mockReturnValue(
      mockUseQueryResult<UsersData>({ data: makeUsersData([makeUser()]) }),
    )
    renderContent()
    expect(within(firstDataRow()).getByText('Active')).toBeInTheDocument()
  })

  it('renders UserStatusBadge as Deleted for a soft-deleted user', () => {
    vi.mocked(useUsers).mockReturnValue(
      mockUseQueryResult<UsersData>({
        data: makeUsersData([makeUser({ deletedAt: '2024-06-01T00:00:00.000Z' })]),
      }),
    )
    renderContent()
    expect(within(firstDataRow()).getByText('Deleted')).toBeInTheDocument()
  })

  it('renders UserStatusBadge as Banned for a banned user', () => {
    vi.mocked(useUsers).mockReturnValue(
      mockUseQueryResult<UsersData>({
        data: makeUsersData([makeUser({ bannedAt: '2024-06-01T00:00:00.000Z' })]),
      }),
    )
    renderContent()
    expect(within(firstDataRow()).getByText('Banned')).toBeInTheDocument()
  })

  it('shows empty state message when no users match', () => {
    vi.mocked(useUsers).mockReturnValue(
      mockUseQueryResult<UsersData>({ data: makeUsersData([]) }),
    )
    renderContent()
    expect(screen.getByText('No users match these filters.')).toBeInTheDocument()
  })

  it('renders row-specific action tooltips using the username', () => {
    vi.mocked(useUsers).mockReturnValue(
      mockUseQueryResult<UsersData>({
        data: makeUsersData([makeUser({ username: 'alice' })]),
      }),
    )
    renderContent()
    expect(screen.getByRole('button', { name: 'Update alice' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete alice' })).toBeInTheDocument()
  })

  it('falls back to email when username is null', () => {
    vi.mocked(useUsers).mockReturnValue(
      mockUseQueryResult<UsersData>({
        data: makeUsersData([makeUser({ username: null, email: 'ghost@keimelion.app' })]),
      }),
    )
    renderContent()
    expect(screen.getByRole('button', { name: 'Update ghost@keimelion.app' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete ghost@keimelion.app' })).toBeInTheDocument()
  })

  describe('sortable columns', () => {
    beforeEach(() => {
      vi.mocked(useUsers).mockReturnValue(
        mockUseQueryResult<UsersData>({ data: makeUsersData([makeUser()]) }),
      )
    })

    it('email column header renders as a sort button', () => {
      renderContent()
      expect(screen.getByRole('button', { name: /sort by email/i })).toBeInTheDocument()
    })

    it('username column header renders as a sort button', () => {
      renderContent()
      expect(screen.getByRole('button', { name: /sort by username/i })).toBeInTheDocument()
    })

    it('created column header renders as a sort button', () => {
      renderContent()
      expect(screen.getByRole('button', { name: /sort by created/i })).toBeInTheDocument()
    })

    it('last active column header renders as a sort button', () => {
      renderContent()
      expect(screen.getByRole('button', { name: /sort by last active/i })).toBeInTheDocument()
    })

    it('role column header does not render as a button', () => {
      renderContent()
      expect(screen.queryByRole('button', { name: /sort by role/i })).not.toBeInTheDocument()
    })

    it('status column header does not render as a button', () => {
      renderContent()
      expect(screen.queryByRole('button', { name: /sort by status/i })).not.toBeInTheDocument()
    })
  })
})
