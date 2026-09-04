import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { ApiUser } from '@/data-access/auth/auth.api'
import {
  SESSION_COOKIE_NAME,
  clearAccessToken,
  clearStoredUser,
  getAccessToken,
  getStoredUser,
  setAccessToken,
  setStoredUser,
  syncSessionCookie,
} from '@/data-access/_auth-storage'

const STORED_USER_KEY = 'keimelion_user'

function readSessionCookie(): string | null {
  const match = document.cookie.split('; ').find((entry) => entry.startsWith(`${SESSION_COOKIE_NAME}=`))
  if (!match) return null
  const value = match.split('=')[1] ?? ''
  return value === '' ? null : value
}

function forceClearSessionCookie(): void {
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0`
}

const TEST_USER: ApiUser = {
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

beforeEach(() => {
  localStorage.clear()
  forceClearSessionCookie()
})

afterEach(() => {
  localStorage.clear()
  forceClearSessionCookie()
})

describe('getAccessToken / setAccessToken / clearAccessToken', () => {
  it('returns null when no token is stored', () => {
    expect(getAccessToken()).toBeNull()
  })

  it('returns the stored token after setAccessToken', () => {
    setAccessToken('my-token')
    expect(getAccessToken()).toBe('my-token')
  })

  it('returns null after clearAccessToken', () => {
    setAccessToken('my-token')
    clearAccessToken()
    expect(getAccessToken()).toBeNull()
  })
})

describe('getStoredUser / setStoredUser / clearStoredUser', () => {
  it('returns null when no user is stored', () => {
    expect(getStoredUser()).toBeNull()
  })

  it('roundtrip: stored user is returned correctly', () => {
    setStoredUser(TEST_USER)
    const retrieved = getStoredUser()
    expect(retrieved).toEqual(TEST_USER)
  })

  it('returns null after clearStoredUser', () => {
    setStoredUser(TEST_USER)
    clearStoredUser()
    expect(getStoredUser()).toBeNull()
  })

  it('returns null and clears key when stored JSON is tampered', () => {
    localStorage.setItem(STORED_USER_KEY, '{not valid json at all!!!}')
    const retrieved = getStoredUser()
    expect(retrieved).toBeNull()
    expect(localStorage.getItem(STORED_USER_KEY)).toBeNull()
  })

  it('returns null and clears key when stored JSON has wrong shape', () => {
    localStorage.setItem(STORED_USER_KEY, JSON.stringify({ foo: 'bar' }))
    const retrieved = getStoredUser()
    expect(retrieved).toBeNull()
    expect(localStorage.getItem(STORED_USER_KEY)).toBeNull()
  })
})

describe('ACCESS_TOKEN_KEY isolation', () => {
  it('token and user keys are independent', () => {
    setAccessToken('tok')
    setStoredUser(TEST_USER)
    clearAccessToken()
    expect(getAccessToken()).toBeNull()
    expect(getStoredUser()).toEqual(TEST_USER)
  })
})

describe('session cookie', () => {
  it('is set when setAccessToken is called', () => {
    setAccessToken('tok')
    expect(readSessionCookie()).toBe('1')
  })

  it('is cleared when clearAccessToken is called', () => {
    setAccessToken('tok')
    clearAccessToken()
    expect(readSessionCookie()).toBeNull()
  })

  it('syncSessionCookie writes the flag when a token exists in localStorage', () => {
    localStorage.setItem('keimelion_access_token', 'existing-tok')
    expect(readSessionCookie()).toBeNull()
    syncSessionCookie()
    expect(readSessionCookie()).toBe('1')
  })

  it('syncSessionCookie clears the flag when no token exists', () => {
    document.cookie = `${SESSION_COOKIE_NAME}=1; path=/; max-age=3600`
    expect(readSessionCookie()).toBe('1')
    syncSessionCookie()
    expect(readSessionCookie()).toBeNull()
  })
})
