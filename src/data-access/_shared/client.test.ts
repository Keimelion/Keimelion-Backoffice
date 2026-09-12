import type { AxiosInstance } from 'axios'
import MockAdapter from 'axios-mock-adapter'
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

async function freshClientModule(): Promise<{
  apiGet: <T>(path: string) => Promise<T>
  apiPost: <T>(path: string, body: unknown) => Promise<T>
  ApiRequestError: new (code: string, message: string, status: number) => Error & { status: number }
  axiosInstance: AxiosInstance
}> {
  vi.resetModules()
  return await import('@/data-access/_shared/client')
}

function mockRefreshFetch(response: { status: number; body?: unknown }): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => {
      const body = response.body ?? null
      return Promise.resolve({
        status: response.status,
        ok: response.status >= 200 && response.status < 300,
        json: () => Promise.resolve(body),
      })
    }),
  )
}

describe('apiGet — happy path', () => {
  it('returns parsed response on 200', async () => {
    const { apiGet, axiosInstance } = await freshClientModule()
    const mock = new MockAdapter(axiosInstance)
    mock.onGet('/users/1').reply(200, { id: '1', name: 'Alice' })

    const result = await apiGet<{ id: string; name: string }>('/users/1')
    expect(result).toEqual({ id: '1', name: 'Alice' })

    mock.restore()
  })

  it('returns null on 204', async () => {
    const { apiGet, axiosInstance } = await freshClientModule()
    const mock = new MockAdapter(axiosInstance)
    mock.onGet('/users/1').reply(204)

    const result = await apiGet<null>('/users/1')
    expect(result).toBeNull()

    mock.restore()
  })
})

describe('reactive 401 interception', () => {
  it('refreshes token and retries original request on 401', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'expired-access')
    localStorage.setItem(REFRESH_TOKEN_KEY, 'valid-refresh')

    const { apiGet, axiosInstance } = await freshClientModule()
    const mock = new MockAdapter(axiosInstance)

    mock.onGet('/users/1').replyOnce(401, { code: 'UNAUTHORIZED', message: 'Unauthorized' })
    mock.onGet('/users/1').replyOnce(200, { id: '1', name: 'Alice' })

    mockRefreshFetch({
      status: 200,
      body: { accessToken: 'new-access', refreshToken: 'new-refresh' },
    })

    const result = await apiGet<{ id: string; name: string }>('/users/1')

    expect(result).toEqual({ id: '1', name: 'Alice' })
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe('new-access')
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('new-refresh')
    expect(mockAssign).not.toHaveBeenCalled()

    mock.restore()
  })

  it('redirects to /login and clears session when refresh call itself returns 401', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'expired-access')
    localStorage.setItem(REFRESH_TOKEN_KEY, 'expired-refresh')

    const { apiGet, ApiRequestError, axiosInstance } = await freshClientModule()
    const mock = new MockAdapter(axiosInstance)

    mock.onGet('/users/1').replyOnce(401, { code: 'UNAUTHORIZED', message: 'Unauthorized' })

    mockRefreshFetch({
      status: 401,
      body: { code: 'UNAUTHORIZED', message: 'Refresh token invalid' },
    })

    await expect(apiGet('/users/1')).rejects.toBeInstanceOf(ApiRequestError)

    expect(mockAssign).toHaveBeenCalledWith('/login')
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull()

    mock.restore()
  })

  it('redirects to /login and clears session when no refresh token is stored', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'expired-access')

    const { apiGet, ApiRequestError, axiosInstance } = await freshClientModule()
    const mock = new MockAdapter(axiosInstance)

    mock.onGet('/users/1').replyOnce(401, { code: 'UNAUTHORIZED', message: 'Unauthorized' })

    await expect(apiGet('/users/1')).rejects.toBeInstanceOf(ApiRequestError)

    expect(mockAssign).toHaveBeenCalledWith('/login')

    mock.restore()
  })

  it('redirects to /login and clears session when refresh body is malformed', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'expired-access')
    localStorage.setItem(REFRESH_TOKEN_KEY, 'valid-refresh')

    const { apiGet, ApiRequestError, axiosInstance } = await freshClientModule()
    const mock = new MockAdapter(axiosInstance)

    mock.onGet('/users/1').replyOnce(401, { code: 'UNAUTHORIZED', message: 'Unauthorized' })

    mockRefreshFetch({ status: 200, body: { totallyWrongShape: true } })

    await expect(apiGet('/users/1')).rejects.toBeInstanceOf(ApiRequestError)

    expect(mockAssign).toHaveBeenCalledWith('/login')
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull()

    mock.restore()
  })

  it('does NOT retry on 401 from /auth/login', async () => {
    const { apiPost, ApiRequestError, axiosInstance } = await freshClientModule()
    const mock = new MockAdapter(axiosInstance)

    mock
      .onPost('/auth/login')
      .replyOnce(401, { code: 'INVALID_CREDENTIALS', message: 'Bad credentials' })

    await expect(
      apiPost('/auth/login', { email: 'x@x.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(ApiRequestError)

    expect(mockAssign).not.toHaveBeenCalled()

    mock.restore()
  })

  it('maps a 5xx with a non-JSON body to INVALID_RESPONSE without crashing', async () => {
    const { apiGet, ApiRequestError, axiosInstance } = await freshClientModule()
    const mock = new MockAdapter(axiosInstance)

    mock.onGet('/users/1').replyOnce(500, '<html>Internal Server Error</html>')

    const caught = await apiGet('/users/1').catch((error: unknown) => error)

    expect(caught).toBeInstanceOf(ApiRequestError)
    expect(caught).toMatchObject({ code: 'INVALID_RESPONSE', status: 500 })

    mock.restore()
  })

  it('maps a network error (no response) to NETWORK_ERROR', async () => {
    const { apiGet, ApiRequestError, axiosInstance } = await freshClientModule()
    const mock = new MockAdapter(axiosInstance)

    mock.onGet('/users/1').networkErrorOnce()

    const caught = await apiGet('/users/1').catch((error: unknown) => error)

    expect(caught).toBeInstanceOf(ApiRequestError)
    expect(caught).toMatchObject({ code: 'NETWORK_ERROR' })

    mock.restore()
  })

  it('deduplicates concurrent refreshes — issues only one refresh call', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'expired-access')
    localStorage.setItem(REFRESH_TOKEN_KEY, 'valid-refresh')

    const { apiGet, axiosInstance } = await freshClientModule()
    const mock = new MockAdapter(axiosInstance)

    mock
      .onGet('/users/1')
      .replyOnce(401, { code: 'UNAUTHORIZED', message: 'Unauthorized' })
      .onGet('/users/1')
      .replyOnce(200, { id: 'http://localhost:3000/v1/users/1' })

    mock
      .onGet('/users/2')
      .replyOnce(401, { code: 'UNAUTHORIZED', message: 'Unauthorized' })
      .onGet('/users/2')
      .replyOnce(200, { id: 'http://localhost:3000/v1/users/2' })

    const fetchMock = vi.fn(() =>
      Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ accessToken: 'new-access', refreshToken: 'new-refresh' }),
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const [result1, result2] = await Promise.all([apiGet('/users/1'), apiGet('/users/2')])

    expect(result1).toEqual({ id: 'http://localhost:3000/v1/users/1' })
    expect(result2).toEqual({ id: 'http://localhost:3000/v1/users/2' })

    expect(fetchMock).toHaveBeenCalledTimes(1)

    mock.restore()
  })
})
