import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockAssign = vi.fn()

vi.mock('@/data-access/_shared/client', () => ({
  refreshAccessToken: vi.fn(),
}))

vi.mock('@/data-access/_shared/auth-storage', () => ({
  getAccessToken: vi.fn(),
  clearSession: vi.fn(),
  getRefreshToken: vi.fn(),
  rotateTokens: vi.fn(),
}))

import { refreshAccessToken } from '@/data-access/_shared/client'
import { clearSession, getAccessToken } from '@/data-access/_shared/auth-storage'

function buildJwtWithExpiry(expiryMs: number): string {
  const payload = { exp: Math.floor(expiryMs / 1000) }
  const encoded = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `header.${encoded}.signature`
}

function buildJwtWithPayload(payload: Record<string, unknown>): string {
  const encoded = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `header.${encoded}.signature`
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  localStorage.clear()
  vi.stubGlobal('window', { location: { assign: mockAssign } })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

async function freshSchedulerModule(): Promise<{
  startAutoRefresh: () => void
  stopAutoRefresh: () => void
}> {
  vi.resetModules()
  return await import('@/data-access/_shared/auth-storage/refresh-scheduler')
}

describe('startAutoRefresh', () => {
  it('is a no-op on the server (no window)', async () => {
    vi.stubGlobal('window', undefined)
    const { startAutoRefresh } = await freshSchedulerModule()
    expect(() => {
      startAutoRefresh()
    }).not.toThrow()
  })

  it('does nothing when no access token is stored', async () => {
    vi.mocked(getAccessToken).mockReturnValue(null)
    const { startAutoRefresh } = await freshSchedulerModule()
    startAutoRefresh()
    await vi.runAllTimersAsync()
    expect(refreshAccessToken).not.toHaveBeenCalled()
  })

  it('schedules refresh ~60 seconds before token expiry', async () => {
    const expiryMs = Date.now() + 5 * 60 * 1000
    const initialToken = buildJwtWithExpiry(expiryMs)
    const newTokenExpiry = Date.now() + 20 * 60 * 1000
    const newToken = buildJwtWithExpiry(newTokenExpiry)

    vi.mocked(getAccessToken).mockReturnValueOnce(initialToken).mockReturnValue(newToken)
    vi.mocked(refreshAccessToken).mockResolvedValue('new-access-token')

    const { startAutoRefresh } = await freshSchedulerModule()
    startAutoRefresh()

    await vi.advanceTimersByTimeAsync(3 * 60 * 1000)
    expect(refreshAccessToken).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(60 * 1000)
    expect(refreshAccessToken).toHaveBeenCalledTimes(1)
  })

  it('fires immediately when token is already expired', async () => {
    const expiryMs = Date.now() - 30 * 1000
    const token = buildJwtWithExpiry(expiryMs)
    vi.mocked(getAccessToken).mockReturnValue(token)
    vi.mocked(refreshAccessToken).mockResolvedValue('new-access-token')

    const { startAutoRefresh } = await freshSchedulerModule()
    startAutoRefresh()

    await vi.advanceTimersByTimeAsync(0)
    expect(refreshAccessToken).toHaveBeenCalledTimes(1)
  })

  it('schedules refresh when payload base64 length requires 2 padding chars', async () => {
    const expiryMs = Date.now() + 5 * 60 * 1000
    const token = buildJwtWithPayload({ exp: Math.floor(expiryMs / 1000), sub: 'x' })
    const rawPayload = token.split('.')[1] ?? ''
    expect(rawPayload.length % 4).toBe(2)

    vi.mocked(getAccessToken).mockReturnValueOnce(token).mockReturnValue(null)
    vi.mocked(refreshAccessToken).mockResolvedValue('new-access-token')

    const { startAutoRefresh } = await freshSchedulerModule()
    startAutoRefresh()

    await vi.advanceTimersByTimeAsync(3 * 60 * 1000)
    expect(refreshAccessToken).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(60 * 1000)
    expect(refreshAccessToken).toHaveBeenCalledTimes(1)
  })
})

describe('stopAutoRefresh', () => {
  it('cancels the scheduled timeout', async () => {
    const expiryMs = Date.now() + 5 * 60 * 1000
    const token = buildJwtWithExpiry(expiryMs)
    vi.mocked(getAccessToken).mockReturnValue(token)
    vi.mocked(refreshAccessToken).mockResolvedValue('new-token')

    const { startAutoRefresh, stopAutoRefresh } = await freshSchedulerModule()
    startAutoRefresh()
    stopAutoRefresh()

    await vi.runAllTimersAsync()
    expect(refreshAccessToken).not.toHaveBeenCalled()
  })

  it('is idempotent — calling stop twice does not throw', async () => {
    const { stopAutoRefresh } = await freshSchedulerModule()
    expect(() => {
      stopAutoRefresh()
      stopAutoRefresh()
    }).not.toThrow()
  })
})

describe('refresh failure', () => {
  it('clears session and redirects to /login when refresh throws', async () => {
    const expiryMs = Date.now() + 2 * 60 * 1000
    const token = buildJwtWithExpiry(expiryMs)
    vi.mocked(getAccessToken).mockReturnValue(token)
    vi.mocked(refreshAccessToken).mockRejectedValue(new Error('Refresh failed'))

    const { startAutoRefresh } = await freshSchedulerModule()
    startAutoRefresh()

    await vi.runAllTimersAsync()

    expect(clearSession).toHaveBeenCalled()
    expect(mockAssign).toHaveBeenCalledWith('/login')
  })
})
