import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, ClientErrorCode } from '@keimelion/sdk/client'
import { ErrorCode } from '@keimelion/sdk/enums'
import { apiErrorBody, createApiMock, type ApiMock } from '@/test/api-mock'

vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000')

const { apiClient, refreshAccessToken } = await import('./client')
const { useLocaleStore } = await import('@/lib/i18n/locale-store')

const ACCESS_TOKEN_KEY = 'keimelion_access_token'
const REFRESH_TOKEN_KEY = 'keimelion_refresh_token'

const USER_RESPONSE = {
  user: {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'admin@keimelion.app',
    username: 'admin',
    authProvider: 'email',
    role: 'admin',
    avatarImageId: null,
    avatar: null,
    isCgvAccepted: true,
    cgvAcceptedAt: null,
    isMarketingOptedIn: false,
    defaultCurrency: 'EUR',
    emailVerifiedAt: null,
    lastActiveAt: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
}

const UNAUTHORIZED_BODY = apiErrorBody('UNAUTHORIZED', 'Unauthorized')

let mock: ApiMock
let assignMock: ReturnType<typeof vi.fn>
let originalLocationDescriptor: PropertyDescriptor | undefined

function storeTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

function failFirstRequestWithUnauthorized(): void {
  mock.onGet('/users/me').reply((request) => {
    if (request.headers.authorization === 'Bearer fresh-access') return [200, USER_RESPONSE]
    return [401, UNAUTHORIZED_BODY]
  })
}

beforeEach(() => {
  localStorage.clear()
  useLocaleStore.setState({ locale: 'en' })
  mock = createApiMock()
  originalLocationDescriptor = Object.getOwnPropertyDescriptor(window, 'location')
  assignMock = vi.fn()
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: { assign: assignMock, protocol: 'http:' },
  })
})

afterEach(() => {
  mock.restore()
  if (originalLocationDescriptor) {
    Object.defineProperty(window, 'location', originalLocationDescriptor)
  }
})

describe('apiClient request headers', () => {
  it('sends the access token as a bearer token', async () => {
    storeTokens('access-1', 'refresh-1')
    mock.onGet('/users/me').reply(200, USER_RESPONSE)

    await apiClient.users.getProfile()

    expect(mock.history.get[0]?.headers.authorization).toBe('Bearer access-1')
  })

  it('sends the store locale as Accept-Language', async () => {
    useLocaleStore.setState({ locale: 'fr' })
    mock.onGet('/occasion-types').reply(200, [])

    await apiClient.occasionTypes.list()

    expect(mock.history.get[0]?.headers['accept-language']).toBe('fr')
  })

  it('reflects a locale change on the next request', async () => {
    mock.onGet('/occasion-types').reply(200, [])

    await apiClient.occasionTypes.list()
    useLocaleStore.setState({ locale: 'fr' })
    await apiClient.occasionTypes.list()

    expect(mock.history.get[0]?.headers['accept-language']).toBe('en')
    expect(mock.history.get[1]?.headers['accept-language']).toBe('fr')
  })
})

describe('apiClient session recovery', () => {
  it('refreshes once and replays the request on 401', async () => {
    storeTokens('stale-access', 'refresh-1')
    failFirstRequestWithUnauthorized()
    mock
      .onPost('/auth/refresh')
      .reply(200, { accessToken: 'fresh-access', refreshToken: 'fresh-refresh' })

    const { user } = await apiClient.users.getProfile()

    expect(user.email).toBe('admin@keimelion.app')
    expect(mock.history.post).toHaveLength(1)
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe('fresh-access')
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('fresh-refresh')
  })

  it('coalesces concurrent 401s into a single refresh call', async () => {
    storeTokens('stale-access', 'refresh-1')
    failFirstRequestWithUnauthorized()
    mock
      .onPost('/auth/refresh')
      .reply(200, { accessToken: 'fresh-access', refreshToken: 'fresh-refresh' })

    await Promise.all([
      apiClient.users.getProfile(),
      apiClient.users.getProfile(),
      apiClient.users.getProfile(),
    ])

    expect(mock.history.post).toHaveLength(1)
    expect(mock.history.get).toHaveLength(6)
  })

  it('shares a scheduled refresh with an in-flight request refresh', async () => {
    storeTokens('stale-access', 'refresh-1')
    mock
      .onPost('/auth/refresh')
      .reply(200, { accessToken: 'fresh-access', refreshToken: 'fresh-refresh' })

    await Promise.all([refreshAccessToken(), refreshAccessToken()])

    expect(mock.history.post).toHaveLength(1)
  })

  it('clears the session and redirects when the refresh is rejected', async () => {
    storeTokens('stale-access', 'refresh-1')
    mock.onGet('/users/me').reply(401, UNAUTHORIZED_BODY)
    mock.onPost('/auth/refresh').reply(401, UNAUTHORIZED_BODY)

    await expect(apiClient.users.getProfile()).rejects.toMatchObject({ status: 401 })

    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull()
    expect(assignMock).toHaveBeenCalledWith('/login')
  })

  it('clears the session and redirects when no refresh token is stored', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'stale-access')
    mock.onGet('/users/me').reply(401, UNAUTHORIZED_BODY)

    await expect(apiClient.users.getProfile()).rejects.toBeInstanceOf(ApiError)

    expect(mock.history.post).toHaveLength(0)
    expect(assignMock).toHaveBeenCalledWith('/login')
  })

  it('does not attempt a refresh when login returns 401', async () => {
    mock
      .onPost('/auth/login')
      .reply(401, apiErrorBody(ErrorCode.INVALID_CREDENTIALS, 'Invalid credentials'))

    await expect(
      apiClient.auth.login({ email: 'a@keimelion.app', password: 'wrong-password' }),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_CREDENTIALS, status: 401 })

    expect(mock.history.post).toHaveLength(1)
    expect(assignMock).not.toHaveBeenCalled()
  })
})

describe('apiClient error mapping', () => {
  it('maps API error bodies to ApiError with validation issues', async () => {
    mock.onGet('/occasion-types').reply(422, {
      code: ErrorCode.UNPROCESSABLE_ENTITY,
      message: 'Validation failed',
      metadata: { issues: [{ path: 'name', message: 'Too short', code: 'too_small' }] },
    })

    await expect(apiClient.occasionTypes.list()).rejects.toMatchObject({
      status: 422,
      code: ErrorCode.UNPROCESSABLE_ENTITY,
      issues: [{ path: 'name', message: 'Too short', code: 'too_small' }],
    })
  })

  it('maps a transport failure to NETWORK_ERROR with status 0', async () => {
    mock.onGet('/occasion-types').networkError()

    await expect(apiClient.occasionTypes.list()).rejects.toMatchObject({
      status: 0,
      code: ClientErrorCode.NETWORK_ERROR,
    })
  })

  it('maps a non-contract response body to INVALID_RESPONSE', async () => {
    mock.onGet('/occasion-types').reply(200, { unexpected: true })

    await expect(apiClient.occasionTypes.list()).rejects.toMatchObject({
      code: ClientErrorCode.INVALID_RESPONSE,
    })
  })
})
