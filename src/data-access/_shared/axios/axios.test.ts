import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000')

const { refreshTokensMock } = vi.hoisted(() => ({ refreshTokensMock: vi.fn() }))

vi.mock('@/data-access/auth/refresh', () => ({
  refreshTokens: refreshTokensMock,
}))

const ACCESS_TOKEN_KEY = 'keimelion_access_token'
const REFRESH_TOKEN_KEY = 'keimelion_refresh_token'

const mockAssign = vi.fn()

vi.stubGlobal('window', { location: { assign: mockAssign } })

const { axiosInstance } = await import('@/data-access/_shared/axios')
const { ApiRequestError } = await import('@/data-access/_shared/api-error')
const { useLocaleStore } = await import('@/lib/i18n/locale-store')
const { useCurrencyStore } = await import('@/lib/i18n/currency-store')

let mock: MockAdapter

beforeEach(() => {
  localStorage.clear()
  mockAssign.mockReset()
  refreshTokensMock.mockReset()
  mock = new MockAdapter(axiosInstance)
})

afterEach(() => {
  mock.restore()
})

describe('axiosInstance — happy path', () => {
  it('returns the response data on 200', async () => {
    mock.onGet('/users/1').reply(200, { id: '1', name: 'Alice' })

    const response = await axiosInstance.get<{ id: string; name: string }>('/users/1')
    expect(response.data).toEqual({ id: '1', name: 'Alice' })
  })
})

describe('Accept-Language interceptor', () => {
  it('attaches the current store locale to every request', async () => {
    useLocaleStore.setState({ locale: 'fr' })
    mock.onGet('/occasion-types').reply(200, [])

    await axiosInstance.get('/occasion-types')

    expect(mock.history.get[0]?.headers?.['Accept-Language']).toBe('fr')
  })

  it('reflects a locale change on the next request without recreating the client', async () => {
    useLocaleStore.setState({ locale: 'en' })
    mock.onGet('/occasion-types').reply(200, [])

    await axiosInstance.get('/occasion-types')
    useLocaleStore.setState({ locale: 'fr' })
    await axiosInstance.get('/occasion-types')

    expect(mock.history.get[0]?.headers?.['Accept-Language']).toBe('en')
    expect(mock.history.get[1]?.headers?.['Accept-Language']).toBe('fr')
  })
})

describe('currency interceptor', () => {
  it('appends ?currency= from the store on admin GET requests', async () => {
    useCurrencyStore.setState({ currency: 'USD' })
    mock.onGet('/admin/lists').reply(200, { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } })

    await axiosInstance.get('/admin/lists')

    expect(mock.history.get[0]?.params).toMatchObject({ currency: 'USD' })
  })

  it('does NOT append ?currency= on non-admin GET requests', async () => {
    useCurrencyStore.setState({ currency: 'USD' })
    mock.onGet('/occasion-types').reply(200, [])

    await axiosInstance.get('/occasion-types')

    expect(mock.history.get[0]?.params ?? {}).not.toHaveProperty('currency')
  })

  it('does NOT append ?currency= on auth routes', async () => {
    useCurrencyStore.setState({ currency: 'USD' })
    mock.onPost('/auth/login').reply(200, {})

    await axiosInstance.post('/auth/login', { email: 'a@b.com', password: 'secret' })

    expect(mock.history.post[0]?.params ?? {}).not.toHaveProperty('currency')
  })

  it('does NOT append ?currency= on admin non-GET requests', async () => {
    useCurrencyStore.setState({ currency: 'USD' })
    mock.onPatch('/admin/lists/abc').reply(200, { list: {} })

    await axiosInstance.patch('/admin/lists/abc', {})

    expect(mock.history.patch[0]?.params ?? {}).not.toHaveProperty('currency')
  })

  it('reflects a currency change on the next admin GET without recreating the client', async () => {
    useCurrencyStore.setState({ currency: 'EUR' })
    mock.onGet('/admin/lists').reply(200, { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } })

    await axiosInstance.get('/admin/lists')
    useCurrencyStore.setState({ currency: 'JPY' })
    await axiosInstance.get('/admin/lists')

    expect(mock.history.get[0]?.params).toMatchObject({ currency: 'EUR' })
    expect(mock.history.get[1]?.params).toMatchObject({ currency: 'JPY' })
  })

  it('does not overwrite an explicit currency param supplied by the caller', async () => {
    useCurrencyStore.setState({ currency: 'EUR' })
    mock.onGet('/admin/lists').reply(200, { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } })

    await axiosInstance.get('/admin/lists', { params: { currency: 'GBP' } })

    expect(mock.history.get[0]?.params).toMatchObject({ currency: 'GBP' })
  })

  it('preserves other query params when appending ?currency=', async () => {
    useCurrencyStore.setState({ currency: 'USD' })
    mock.onGet('/admin/lists').reply(200, { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } })

    await axiosInstance.get('/admin/lists', { params: { page: '2', limit: '20' } })

    expect(mock.history.get[0]?.params).toMatchObject({ currency: 'USD', page: '2', limit: '20' })
  })
})

describe('reactive 401 interception', () => {
  it('refreshes token and retries original request on 401', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'expired-access')
    localStorage.setItem(REFRESH_TOKEN_KEY, 'valid-refresh')

    mock.onGet('/users/1').replyOnce(401, { code: 'UNAUTHORIZED', message: 'Unauthorized' })
    mock.onGet('/users/1').replyOnce(200, { id: '1', name: 'Alice' })

    refreshTokensMock.mockResolvedValue('new-access')

    const response = await axiosInstance.get<{ id: string; name: string }>('/users/1')

    expect(response.data).toEqual({ id: '1', name: 'Alice' })
    expect(refreshTokensMock).toHaveBeenCalledWith('valid-refresh')
    expect(mockAssign).not.toHaveBeenCalled()
  })

  it('redirects to /login and clears session when refreshTokens rejects', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'expired-access')
    localStorage.setItem(REFRESH_TOKEN_KEY, 'expired-refresh')

    mock.onGet('/users/1').replyOnce(401, { code: 'UNAUTHORIZED', message: 'Unauthorized' })
    refreshTokensMock.mockRejectedValue(new Error('Refresh failed'))

    await expect(axiosInstance.get('/users/1')).rejects.toBeInstanceOf(ApiRequestError)

    expect(mockAssign).toHaveBeenCalledWith('/login')
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull()
  })

  it('redirects to /login and clears session when no refresh token is stored', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'expired-access')

    mock.onGet('/users/1').replyOnce(401, { code: 'UNAUTHORIZED', message: 'Unauthorized' })

    await expect(axiosInstance.get('/users/1')).rejects.toBeInstanceOf(ApiRequestError)

    expect(refreshTokensMock).not.toHaveBeenCalled()
    expect(mockAssign).toHaveBeenCalledWith('/login')
  })

  it('does NOT retry on 401 from /auth/login', async () => {
    mock
      .onPost('/auth/login')
      .replyOnce(401, { code: 'INVALID_CREDENTIALS', message: 'Bad credentials' })

    await expect(
      axiosInstance.post('/auth/login', { email: 'x@x.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(ApiRequestError)

    expect(refreshTokensMock).not.toHaveBeenCalled()
    expect(mockAssign).not.toHaveBeenCalled()
  })

  it('maps a 5xx with a non-JSON body to INVALID_RESPONSE without crashing', async () => {
    mock.onGet('/users/1').replyOnce(500, '<html>Internal Server Error</html>')

    const caught = await axiosInstance.get('/users/1').catch((error: unknown) => error)

    expect(caught).toBeInstanceOf(ApiRequestError)
    expect(caught).toMatchObject({ code: 'INVALID_RESPONSE', status: 500 })
  })

  it('extracts validation issues from a 422 metadata.issues payload', async () => {
    mock.onPost('/admin/items').replyOnce(422, {
      code: 'UNPROCESSABLE_ENTITY',
      message: 'Validation failed',
      metadata: {
        issues: [
          { path: 'name', message: 'Name is required.', code: 'too_small' },
          { path: 'imageUrl', message: 'Image URL must use HTTPS.', code: 'custom' },
        ],
      },
    })

    const caught = await axiosInstance.post('/admin/items', {}).catch((error: unknown) => error)

    expect(caught).toBeInstanceOf(ApiRequestError)
    expect(caught).toMatchObject({
      code: 'UNPROCESSABLE_ENTITY',
      status: 422,
      issues: [
        { path: 'name', message: 'Name is required.', code: 'too_small' },
        { path: 'imageUrl', message: 'Image URL must use HTTPS.', code: 'custom' },
      ],
    })
  })

  it('leaves issues as null when the error body omits metadata', async () => {
    mock.onGet('/users/1').replyOnce(409, { code: 'CONFLICT', message: 'Already exists' })

    const caught = await axiosInstance.get('/users/1').catch((error: unknown) => error)

    expect(caught).toBeInstanceOf(ApiRequestError)
    expect(caught).toMatchObject({ code: 'CONFLICT', status: 409, issues: null })
  })

  it('maps a network error (no response) to NETWORK_ERROR', async () => {
    mock.onGet('/users/1').networkErrorOnce()

    const caught = await axiosInstance.get('/users/1').catch((error: unknown) => error)

    expect(caught).toBeInstanceOf(ApiRequestError)
    expect(caught).toMatchObject({ code: 'NETWORK_ERROR' })
  })

  it('deduplicates concurrent refreshes — issues only one refreshTokens call', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'expired-access')
    localStorage.setItem(REFRESH_TOKEN_KEY, 'valid-refresh')

    mock
      .onGet('/users/1')
      .replyOnce(401, { code: 'UNAUTHORIZED', message: 'Unauthorized' })
      .onGet('/users/1')
      .replyOnce(200, { id: '1' })

    mock
      .onGet('/users/2')
      .replyOnce(401, { code: 'UNAUTHORIZED', message: 'Unauthorized' })
      .onGet('/users/2')
      .replyOnce(200, { id: '2' })

    refreshTokensMock.mockResolvedValue('new-access')

    const [response1, response2] = await Promise.all([
      axiosInstance.get('/users/1'),
      axiosInstance.get('/users/2'),
    ])

    expect(response1.data).toEqual({ id: '1' })
    expect(response2.data).toEqual({ id: '2' })
    expect(refreshTokensMock).toHaveBeenCalledTimes(1)
  })
})
