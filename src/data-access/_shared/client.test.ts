import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const ACCESS_TOKEN_KEY = 'keimelion_access_token'
const REFRESH_TOKEN_KEY = 'keimelion_refresh_token'

const mockAssign = vi.fn()

vi.stubGlobal('window', {
  location: { assign: mockAssign },
})

vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000')

beforeEach(() => {
  localStorage.clear()
  mockAssign.mockReset()
  vi.unstubAllGlobals()
  vi.stubGlobal('window', { location: { assign: mockAssign } })
  vi.unstubAllEnvs()
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000')
})

afterEach(() => {
  vi.restoreAllMocks()
})

interface MockResponse {
  status: number
  body?: unknown
}

async function freshClientModule(): Promise<{
  apiGet: <T>(path: string) => Promise<T>
  apiPost: <T>(path: string, body: unknown) => Promise<T>
  ApiRequestError: new (code: string, message: string, status: number) => Error & { status: number }
}> {
  vi.resetModules()
  return await import('@/data-access/_shared/client')
}

function mockFetch(...responses: MockResponse[]): void {
  let callCount = 0
  vi.stubGlobal(
    'fetch',
    vi.fn(() => {
      const config = responses[callCount] ?? responses[responses.length - 1]
      callCount++
      if (!config) throw new Error('No fetch mock configured')
      const body = config.body ?? null
      return Promise.resolve({
        status: config.status,
        ok: config.status >= 200 && config.status < 300,
        json: () => Promise.resolve(body),
      })
    }),
  )
}

describe('apiGet — happy path', () => {
  it('returns parsed response on 200', async () => {
    mockFetch({ status: 200, body: { id: '1', name: 'Alice' } })
    const { apiGet } = await freshClientModule()
    const result = await apiGet<{ id: string; name: string }>('/users/1')
    expect(result).toEqual({ id: '1', name: 'Alice' })
  })

  it('returns null on 204', async () => {
    mockFetch({ status: 204 })
    const { apiGet } = await freshClientModule()
    const result = await apiGet<null>('/users/1')
    expect(result).toBeNull()
  })
})

describe('reactive 401 interception', () => {
  it('refreshes token and retries original request on 401', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'expired-access')
    localStorage.setItem(REFRESH_TOKEN_KEY, 'valid-refresh')

    mockFetch(
      { status: 401, body: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      {
        status: 200,
        body: { accessToken: 'new-access', refreshToken: 'new-refresh' },
      },
      { status: 200, body: { id: '1', name: 'Alice' } },
    )

    const { apiGet } = await freshClientModule()
    const result = await apiGet<{ id: string; name: string }>('/users/1')

    expect(result).toEqual({ id: '1', name: 'Alice' })
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe('new-access')
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('new-refresh')
    expect(mockAssign).not.toHaveBeenCalled()
  })

  it('redirects to /login and clears session when refresh call itself returns 401', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'expired-access')
    localStorage.setItem(REFRESH_TOKEN_KEY, 'expired-refresh')

    mockFetch(
      { status: 401, body: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401, body: { code: 'UNAUTHORIZED', message: 'Refresh token invalid' } },
    )

    const { apiGet, ApiRequestError } = await freshClientModule()

    await expect(apiGet('/users/1')).rejects.toBeInstanceOf(ApiRequestError)

    expect(mockAssign).toHaveBeenCalledWith('/login')
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull()
  })

  it('redirects to /login and clears session when no refresh token is stored', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'expired-access')

    mockFetch({ status: 401, body: { code: 'UNAUTHORIZED', message: 'Unauthorized' } })

    const { apiGet, ApiRequestError } = await freshClientModule()

    await expect(apiGet('/users/1')).rejects.toBeInstanceOf(ApiRequestError)

    expect(mockAssign).toHaveBeenCalledWith('/login')
  })

  it('redirects to /login and clears session when refresh body is malformed', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'expired-access')
    localStorage.setItem(REFRESH_TOKEN_KEY, 'valid-refresh')

    mockFetch(
      { status: 401, body: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 200, body: { totallyWrongShape: true } },
    )

    const { apiGet, ApiRequestError } = await freshClientModule()

    await expect(apiGet('/users/1')).rejects.toBeInstanceOf(ApiRequestError)

    expect(mockAssign).toHaveBeenCalledWith('/login')
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull()
  })

  it('does NOT retry on 401 from /auth/login', async () => {
    mockFetch({ status: 401, body: { code: 'INVALID_CREDENTIALS', message: 'Bad credentials' } })

    const { apiPost, ApiRequestError } = await freshClientModule()

    await expect(
      apiPost('/auth/login', { email: 'x@x.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(ApiRequestError)

    expect(mockAssign).not.toHaveBeenCalled()
  })

  it('deduplicates concurrent refreshes — issues only one refresh call', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'expired-access')
    localStorage.setItem(REFRESH_TOKEN_KEY, 'valid-refresh')

    const seenUrls: Record<string, number> = {}
    const fetchMock = vi.fn((url: string) => {
      seenUrls[url] = (seenUrls[url] ?? 0) + 1
      const visitCount = seenUrls[url] ?? 1

      if (url.endsWith('/auth/refresh')) {
        return Promise.resolve({
          status: 200,
          ok: true,
          json: () => Promise.resolve({ accessToken: 'new-access', refreshToken: 'new-refresh' }),
        })
      }

      if ((url.endsWith('/users/1') || url.endsWith('/users/2')) && visitCount === 1) {
        return Promise.resolve({
          status: 401,
          ok: false,
          json: () => Promise.resolve({ code: 'UNAUTHORIZED', message: 'Unauthorized' }),
        })
      }

      return Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ id: url }),
      })
    })

    vi.stubGlobal('fetch', fetchMock)

    const { apiGet } = await freshClientModule()

    const [result1, result2] = await Promise.all([apiGet('/users/1'), apiGet('/users/2')])

    expect(result1).toEqual({ id: 'http://localhost:3000/v1/users/1' })
    expect(result2).toEqual({ id: 'http://localhost:3000/v1/users/2' })

    const refreshCallCount = (fetchMock.mock.calls as [string][]).filter(([calledUrl]) =>
      calledUrl.endsWith('/auth/refresh'),
    ).length

    expect(refreshCallCount).toBe(1)
  })
})
