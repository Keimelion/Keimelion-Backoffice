import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { ApiUser } from '@/data-access/auth/auth.api'
import {
  SESSION_COOKIE_NAME,
  clearSession,
  getAccessToken,
  getStoredUser,
  isAllowedBackofficeRole,
  saveSession,
  syncSessionCookie,
} from '@/data-access/_auth-storage'

const STORED_USER_KEY = 'keimelion_user'
const ACCESS_TOKEN_KEY = 'keimelion_access_token'

function readSessionCookie(): string | null {
  const match = document.cookie.split('; ').find((entry) => entry.startsWith(`${SESSION_COOKIE_NAME}=`))
  if (!match) return null
  const value = match.split('=')[1] ?? ''
  return value === '' ? null : value
}

function forceClearSessionCookie(): void {
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0`
}

const ADMIN_USER: ApiUser = {
  id: 'user-1',
  email: 'admin@keimelion.app',
  username: 'admin',
  authProvider: 'email' as const,
  role: 'admin' as const,
  avatarUrl: null,
  isCgvAccepted: true,
  cgvAcceptedAt: null,
  isMarketingOptedIn: false,
  emailVerifiedAt: null,
  lastActiveAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const MODERATOR_USER: ApiUser = { ...ADMIN_USER, role: 'moderator' as const }
const REGULAR_USER: ApiUser = { ...ADMIN_USER, role: 'user' as const }

beforeEach(() => {
  localStorage.clear()
  forceClearSessionCookie()
})

afterEach(() => {
  localStorage.clear()
  forceClearSessionCookie()
})

describe('isAllowedBackofficeRole', () => {
  it('accepts admin', () => {
    expect(isAllowedBackofficeRole('admin')).toBe(true)
  })

  it('accepts moderator', () => {
    expect(isAllowedBackofficeRole('moderator')).toBe(true)
  })

  it('rejects user', () => {
    expect(isAllowedBackofficeRole('user')).toBe(false)
  })

  it('rejects unknown role strings', () => {
    expect(isAllowedBackofficeRole('superadmin')).toBe(false)
    expect(isAllowedBackofficeRole('')).toBe(false)
  })
})

describe('saveSession / clearSession', () => {
  it('writes token, user, and role cookie atomically', () => {
    saveSession('tok-abc', ADMIN_USER)
    expect(getAccessToken()).toBe('tok-abc')
    expect(getStoredUser()).toEqual(ADMIN_USER)
    expect(readSessionCookie()).toBe('admin')
  })

  it('writes the moderator role in the cookie', () => {
    saveSession('tok-mod', MODERATOR_USER)
    expect(readSessionCookie()).toBe('moderator')
  })

  it('clears token, user, and cookie atomically', () => {
    saveSession('tok', ADMIN_USER)
    clearSession()
    expect(getAccessToken()).toBeNull()
    expect(getStoredUser()).toBeNull()
    expect(readSessionCookie()).toBeNull()
  })
})

describe('getStoredUser', () => {
  it('returns null when no user is stored', () => {
    expect(getStoredUser()).toBeNull()
  })

  it('returns null and clears key when stored JSON is tampered', () => {
    localStorage.setItem(STORED_USER_KEY, '{not valid json at all!!!}')
    expect(getStoredUser()).toBeNull()
    expect(localStorage.getItem(STORED_USER_KEY)).toBeNull()
  })

  it('returns null and clears key when stored JSON has wrong shape', () => {
    localStorage.setItem(STORED_USER_KEY, JSON.stringify({ foo: 'bar' }))
    expect(getStoredUser()).toBeNull()
    expect(localStorage.getItem(STORED_USER_KEY)).toBeNull()
  })
})

describe('syncSessionCookie', () => {
  it('writes the role when a valid stored user exists', () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'tok')
    localStorage.setItem(STORED_USER_KEY, JSON.stringify(ADMIN_USER))
    expect(readSessionCookie()).toBeNull()
    syncSessionCookie()
    expect(readSessionCookie()).toBe('admin')
  })

  it('clears the cookie when no user is stored', () => {
    document.cookie = `${SESSION_COOKIE_NAME}=admin; path=/; max-age=3600`
    expect(readSessionCookie()).toBe('admin')
    syncSessionCookie()
    expect(readSessionCookie()).toBeNull()
  })

  it('clears the cookie when the stored user has a disallowed role', () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'tok')
    localStorage.setItem(STORED_USER_KEY, JSON.stringify(REGULAR_USER))
    document.cookie = `${SESSION_COOKIE_NAME}=admin; path=/; max-age=3600`
    syncSessionCookie()
    expect(readSessionCookie()).toBeNull()
  })
})
