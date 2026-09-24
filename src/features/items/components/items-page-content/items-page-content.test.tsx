import { screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithQueryClient } from '@/test/test-utils'
import type * as AuthStorageModule from '@/data-access/_shared/auth-storage'

vi.mock('@/data-access/_shared/auth-storage', async (importOriginal) => {
  const actual = await importOriginal<typeof AuthStorageModule>()
  return {
    ...actual,
    getStoredUser: vi.fn(),
  }
})

vi.mock('@/features/items/components/items-list', () => ({
  ItemsList: () => <div>Items list rendered</div>,
}))

import { getStoredUser } from '@/data-access/_shared/auth-storage'
import { ItemsPageContent } from './items-page-content'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ItemsPageContent', () => {
  it('renders a permission-denied state for an unauthenticated user', () => {
    vi.mocked(getStoredUser).mockReturnValue(null)
    renderWithQueryClient(<ItemsPageContent />)
    expect(screen.getByText('Access restricted')).toBeInTheDocument()
    expect(screen.queryByText('Items list rendered')).not.toBeInTheDocument()
  })

  it('renders a permission-denied state for a moderator', () => {
    vi.mocked(getStoredUser).mockReturnValue({
      id: 'mod-1',
      email: 'mod@keimelion.app',
      username: 'mod',
      authProvider: 'email',
      role: 'moderator',
      avatarUrl: null,
      isCgvAccepted: true,
      cgvAcceptedAt: null,
      isMarketingOptedIn: false,
      emailVerifiedAt: null,
      lastActiveAt: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    })
    renderWithQueryClient(<ItemsPageContent />)
    expect(screen.getByText('Access restricted')).toBeInTheDocument()
  })

  it('renders ItemsList for an admin', () => {
    vi.mocked(getStoredUser).mockReturnValue({
      id: 'admin-1',
      email: 'admin@keimelion.app',
      username: 'admin',
      authProvider: 'email',
      role: 'admin',
      avatarUrl: null,
      isCgvAccepted: true,
      cgvAcceptedAt: null,
      isMarketingOptedIn: false,
      emailVerifiedAt: null,
      lastActiveAt: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    })
    renderWithQueryClient(<ItemsPageContent />)
    expect(screen.getByText('Items list rendered')).toBeInTheDocument()
  })
})
