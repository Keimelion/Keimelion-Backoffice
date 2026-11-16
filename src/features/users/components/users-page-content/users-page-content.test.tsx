import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mockUseQueryResult, renderWithQueryClient } from '@/test/test-utils'
import { TooltipProvider } from '@/components/ui/tooltip'
import type * as AuthStorageModule from '@/data-access/_shared/auth-storage'
import { UserStatuses } from '@keimelion/sdk/enums'
import type { UserStatus } from '@keimelion/sdk/enums'

const replaceMock = vi.fn()
const useSearchParamsMock = vi.fn(() => new URLSearchParams())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => useSearchParamsMock(),
}))

vi.mock(import('@/features/users/hooks/use-users'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useUsers: vi.fn(),
  }
})

vi.mock('@/features/auth/hooks/use-current-user-role', () => ({
  useCurrentUserRole: vi.fn(),
}))

vi.mock('@/data-access/_shared/auth-storage', async (importOriginal) => {
  const actual = await importOriginal<typeof AuthStorageModule>()
  return {
    ...actual,
    getStoredUser: vi.fn(),
  }
})

import { useUsers } from '@/features/users/hooks/use-users'
import { useCurrentUserRole } from '@/features/auth/hooks/use-current-user-role'
import { getStoredUser } from '@/data-access/_shared/auth-storage'
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

interface AvatarImage {
  id: string
  hash: string
  mime: string
  sizeBytes: number
  width: number
  height: number
  createdAt: Date
  urls: { sm: string; md: string; lg: string }
}

function makeUser(overrides: Partial<{
  id: string
  email: string
  username: string | null
  deletedAt: Date | null
  bannedAt: Date | null
  role: 'admin' | 'moderator' | 'user'
  status: UserStatus
  avatar: AvatarImage | null
}> = {}) {
  return {
    id: overrides.id ?? 'u1',
    email: overrides.email ?? 'user@keimelion.app',
    username: overrides.username === undefined ? 'testuser' : overrides.username,
    authProvider: 'email' as const,
    role: overrides.role ?? ('user' as const),
    avatarImageId: null,
    avatar: overrides.avatar ?? null,
    isCgvAccepted: true,
    cgvAcceptedAt: null,
    isMarketingOptedIn: false,
    defaultCurrency: 'EUR' as const,
    emailVerifiedAt: null,
    lastActiveAt: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    bannedAt: overrides.bannedAt ?? null,
    banReason: null,
    deletedAt: overrides.deletedAt ?? null,
    activatedAt: null,
    status: overrides.status ?? UserStatuses.ACTIVE,
    reservationsCount: 0,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  useSearchParamsMock.mockReturnValue(new URLSearchParams())
  vi.mocked(useCurrentUserRole).mockReturnValue(null)
  vi.mocked(getStoredUser).mockReturnValue(null)
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

  it.each([
    [UserStatuses.ACTIVE, 'Active'],
    [UserStatuses.INACTIVE, 'Inactive'],
    [UserStatuses.UNVERIFIED, 'Unverified'],
    [UserStatuses.INVITED, 'Invited'],
    [UserStatuses.BANNED, 'Banned'],
    [UserStatuses.PENDING_DELETION, 'Pending deletion'],
  ])('renders the %s status badge from the stored status', (status, label) => {
    vi.mocked(useUsers).mockReturnValue(
      mockUseQueryResult<UsersData>({ data: makeUsersData([makeUser({ status })]) }),
    )
    renderContent()
    expect(within(firstDataRow()).getByText(label)).toBeInTheDocument()
  })

  it('shows empty state message when no users match', () => {
    vi.mocked(useUsers).mockReturnValue(
      mockUseQueryResult<UsersData>({ data: makeUsersData([]) }),
    )
    renderContent()
    expect(screen.getByText('No users match these filters.')).toBeInTheDocument()
  })

  it('renders the initial fallback in the avatar column when the user has no avatar', () => {
    vi.mocked(useUsers).mockReturnValue(
      mockUseQueryResult<UsersData>({
        data: makeUsersData([makeUser({ username: 'alice' })]),
      }),
    )
    renderContent()
    expect(within(firstDataRow()).getByRole('img', { name: 'alice' })).toHaveTextContent('A')
  })

  it('renders avatar.urls.sm in the avatar column when the user has an uploaded avatar', () => {
    vi.mocked(useUsers).mockReturnValue(
      mockUseQueryResult<UsersData>({
        data: makeUsersData([
          makeUser({
            username: 'alice',
            avatar: {
              id: 'img-1',
              hash: 'h',
              mime: 'image/webp',
              sizeBytes: 1024,
              width: 300,
              height: 300,
              createdAt: new Date('2024-01-01T00:00:00.000Z'),
              urls: {
                sm: 'https://cdn.example.com/avatar-sm.webp',
                md: 'https://cdn.example.com/avatar-md.webp',
                lg: 'https://cdn.example.com/avatar-lg.webp',
              },
            },
          }),
        ]),
      }),
    )
    renderContent()
    const img = within(firstDataRow()).getByAltText('alice')
    expect(img.tagName).toBe('IMG')
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/avatar-sm.webp')
  })

  it('renders row-specific action tooltips using the username when signed in as admin', () => {
    vi.mocked(useCurrentUserRole).mockReturnValue('admin')
    vi.mocked(getStoredUser).mockReturnValue({
      id: 'admin-id',
      email: 'admin@keimelion.app',
      username: 'adminuser',
      authProvider: 'email',
      role: 'admin',
      avatarImageId: null,
      avatar: null,
      isCgvAccepted: true,
      cgvAcceptedAt: null,
      isMarketingOptedIn: false,
      defaultCurrency: 'EUR' as const,
      emailVerifiedAt: null,
      lastActiveAt: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    })
    vi.mocked(useUsers).mockReturnValue(
      mockUseQueryResult<UsersData>({
        data: makeUsersData([makeUser({ username: 'alice', id: 'u-alice' })]),
      }),
    )
    renderContent()
    expect(screen.getByRole('button', { name: 'Update alice' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete alice' })).toBeInTheDocument()
  })

  it('falls back to email when username is null for admin actions', () => {
    vi.mocked(useCurrentUserRole).mockReturnValue('admin')
    vi.mocked(getStoredUser).mockReturnValue({
      id: 'admin-id',
      email: 'admin@keimelion.app',
      username: 'adminuser',
      authProvider: 'email',
      role: 'admin',
      avatarImageId: null,
      avatar: null,
      isCgvAccepted: true,
      cgvAcceptedAt: null,
      isMarketingOptedIn: false,
      defaultCurrency: 'EUR' as const,
      emailVerifiedAt: null,
      lastActiveAt: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    })
    vi.mocked(useUsers).mockReturnValue(
      mockUseQueryResult<UsersData>({
        data: makeUsersData([makeUser({ username: null, email: 'ghost@keimelion.app', id: 'u-ghost' })]),
      }),
    )
    renderContent()
    expect(screen.getByRole('button', { name: 'Update ghost@keimelion.app' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete ghost@keimelion.app' })).toBeInTheDocument()
  })

  it('hides Create button and action icons when signed in as moderator', () => {
    vi.mocked(useCurrentUserRole).mockReturnValue('moderator')
    vi.mocked(useUsers).mockReturnValue(
      mockUseQueryResult<UsersData>({
        data: makeUsersData([makeUser({ username: 'bob' })]),
      }),
    )
    renderContent()
    expect(screen.queryByRole('button', { name: /create user/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /update/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('shows Create button when signed in as admin', () => {
    vi.mocked(useCurrentUserRole).mockReturnValue('admin')
    vi.mocked(getStoredUser).mockReturnValue({
      id: 'admin-id',
      email: 'admin@keimelion.app',
      username: 'adminuser',
      authProvider: 'email',
      role: 'admin',
      avatarImageId: null,
      avatar: null,
      isCgvAccepted: true,
      cgvAcceptedAt: null,
      isMarketingOptedIn: false,
      defaultCurrency: 'EUR' as const,
      emailVerifiedAt: null,
      lastActiveAt: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    })
    vi.mocked(useUsers).mockReturnValue(
      mockUseQueryResult<UsersData>({ data: makeUsersData([]) }),
    )
    renderContent()
    expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument()
  })

  it('disables Edit and Delete buttons on the admin own row with self-guard tooltip', () => {
    vi.mocked(useCurrentUserRole).mockReturnValue('admin')
    vi.mocked(getStoredUser).mockReturnValue({
      id: 'admin-id',
      email: 'admin@keimelion.app',
      username: 'adminuser',
      authProvider: 'email',
      role: 'admin',
      avatarImageId: null,
      avatar: null,
      isCgvAccepted: true,
      cgvAcceptedAt: null,
      isMarketingOptedIn: false,
      defaultCurrency: 'EUR' as const,
      emailVerifiedAt: null,
      lastActiveAt: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    })
    vi.mocked(useUsers).mockReturnValue(
      mockUseQueryResult<UsersData>({
        data: makeUsersData([makeUser({ id: 'admin-id', username: 'adminuser' })]),
      }),
    )
    renderContent()
    const editButton = screen.getByRole('button', { name: 'You cannot edit your own account.' })
    const deleteButton = screen.getByRole('button', { name: 'You cannot delete your own account.' })
    expect(editButton).toBeDisabled()
    expect(deleteButton).toBeDisabled()
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

  describe('status filter', () => {
    beforeEach(() => {
      vi.mocked(useUsers).mockReturnValue(
        mockUseQueryResult<UsersData>({ data: makeUsersData([makeUser()]) }),
      )
    })

    it('requests the default list without a status filter', () => {
      renderContent()
      expect(vi.mocked(useUsers)).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: undefined }),
      )
      expect(screen.getByLabelText('Status')).toHaveTextContent('All statuses')
    })

    it('passes the statuses kept in the URL to the users query', () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams('status=invited,pending_deletion'))
      renderContent()
      expect(vi.mocked(useUsers)).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: ['invited', 'pending_deletion'] }),
      )
      expect(screen.getByLabelText('Status')).toHaveTextContent('Pending deletion, Invited')
    })

    it('adds a status picked in the dropdown to the URL in the SDK status order', async () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams('status=invited'))
      renderContent()
      await userEvent.click(screen.getByLabelText('Status'))
      await userEvent.click(await screen.findByRole('menuitemcheckbox', { name: 'Pending deletion' }))
      expect(replaceMock).toHaveBeenLastCalledWith('?status=pending_deletion%2Cinvited', { scroll: false })
    })

    it('removes the status param when the last selected status is unchecked', async () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams('status=invited'))
      renderContent()
      await userEvent.click(screen.getByLabelText('Status'))
      await userEvent.click(await screen.findByRole('menuitemcheckbox', { name: 'Invited' }))
      expect(replaceMock).toHaveBeenLastCalledWith('?', { scroll: false })
    })
  })

  it('places the status column right after the role column', () => {
    vi.mocked(useUsers).mockReturnValue(
      mockUseQueryResult<UsersData>({ data: makeUsersData([makeUser()]) }),
    )
    renderContent()
    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent)
    const roleIndex = headers.indexOf('Role')
    expect(roleIndex).toBeGreaterThan(-1)
    expect(headers[roleIndex + 1]).toBe('Status')
  })

  describe('resend invitation action', () => {
    const RESEND_LABEL = 'Resend invitation to user@keimelion.app'

    function renderWithStatus(status: UserStatus, role: 'admin' | 'moderator'): void {
      vi.mocked(useCurrentUserRole).mockReturnValue(role)
      vi.mocked(useUsers).mockReturnValue(
        mockUseQueryResult<UsersData>({
          data: makeUsersData([makeUser({ status, username: null })]),
        }),
      )
      renderContent()
    }

    it('renders the action on an invited row for an admin', () => {
      renderWithStatus(UserStatuses.INVITED, 'admin')
      expect(within(firstDataRow()).getByRole('button', { name: RESEND_LABEL })).toBeEnabled()
    })

    it.each([
      UserStatuses.ACTIVE,
      UserStatuses.INACTIVE,
      UserStatuses.UNVERIFIED,
      UserStatuses.BANNED,
      UserStatuses.PENDING_DELETION,
    ])('does not render the action on a %s row', (status) => {
      renderWithStatus(status, 'admin')
      expect(screen.queryByRole('button', { name: RESEND_LABEL })).not.toBeInTheDocument()
    })

    it('does not render the action for a moderator viewer', () => {
      renderWithStatus(UserStatuses.INVITED, 'moderator')
      expect(screen.queryByRole('button', { name: RESEND_LABEL })).not.toBeInTheDocument()
    })
  })
})
