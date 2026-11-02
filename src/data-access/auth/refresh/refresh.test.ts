import MockAdapter from 'axios-mock-adapter'
import type { AxiosInstance } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000')

const ACCESS_TOKEN_KEY = 'keimelion_access_token'
const REFRESH_TOKEN_KEY = 'keimelion_refresh_token'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

async function freshRefreshModule(): Promise<{
  refreshTokens: (token: string) => Promise<string>
  refreshHttp: AxiosInstance
  ApiRequestError: new (code: string, message: string, status: number) => Error & { code: string; status: number }
}> {
  vi.resetModules()
  const [{ refreshTokens, refreshHttp }, { ApiRequestError }] = await Promise.all([
    import('@/data-access/auth/refresh'),
    import('@/data-access/_shared/api-error'),
  ])
  return { refreshTokens, refreshHttp, ApiRequestError }
}

describe('refreshTokens', () => {
  it('returns the new access token and rotates both tokens in storage on success', async () => {
    const { refreshTokens, refreshHttp } = await freshRefreshModule()
    const mock = new MockAdapter(refreshHttp)
    mock
      .onPost('/auth/refresh', { refreshToken: 'old-refresh' })
      .replyOnce(200, { accessToken: 'new-access', refreshToken: 'new-refresh' })

    const accessToken = await refreshTokens('old-refresh')

    expect(accessToken).toBe('new-access')
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe('new-access')
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('new-refresh')

    mock.restore()
  })

  it('throws ApiRequestError when the response body is malformed', async () => {
    const { refreshTokens, refreshHttp, ApiRequestError } = await freshRefreshModule()
    const mock = new MockAdapter(refreshHttp)
    mock.onPost('/auth/refresh').replyOnce(200, { totallyWrongShape: true })

    await expect(refreshTokens('old-refresh')).rejects.toBeInstanceOf(ApiRequestError)
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull()

    mock.restore()
  })

  it('propagates the axios error when the endpoint returns 401', async () => {
    const { refreshTokens, refreshHttp } = await freshRefreshModule()
    const mock = new MockAdapter(refreshHttp)
    mock.onPost('/auth/refresh').replyOnce(401, { code: 'UNAUTHORIZED', message: 'Refresh token invalid' })

    await expect(refreshTokens('old-refresh')).rejects.toThrow()
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull()

    mock.restore()
  })
})
