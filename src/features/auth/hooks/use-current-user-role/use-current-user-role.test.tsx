import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { createQueryClientWrapper } from '@/test/test-utils'

vi.mock('@/data-access/_shared/auth-storage', () => ({
  getAccessToken: vi.fn(() => null),
  getRefreshToken: vi.fn(() => null),
  rotateTokens: vi.fn(),
  getStoredUser: vi.fn(),
}))

import { getStoredUser } from '@/data-access/_shared/auth-storage'
import { useCurrentUserRole } from './use-current-user-role'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useCurrentUserRole', () => {
  it('returns the role of the stored user', () => {
    vi.mocked(getStoredUser).mockReturnValue({
      id: 'u-1',
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

    const { result } = renderHook(() => useCurrentUserRole(), {
      wrapper: createQueryClientWrapper(),
    })

    expect(result.current).toBe('admin')
  })

  it('returns null when no user is stored', () => {
    vi.mocked(getStoredUser).mockReturnValue(null)

    const { result } = renderHook(() => useCurrentUserRole(), {
      wrapper: createQueryClientWrapper(),
    })

    expect(result.current).toBeNull()
  })

  it('returns moderator role when stored user is a moderator', () => {
    vi.mocked(getStoredUser).mockReturnValue({
      id: 'u-2',
      email: 'mod@keimelion.app',
      username: 'moduser',
      authProvider: 'email',
      role: 'moderator',
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

    const { result } = renderHook(() => useCurrentUserRole(), {
      wrapper: createQueryClientWrapper(),
    })

    expect(result.current).toBe('moderator')
  })
})
