import { beforeEach, describe, expect, it } from 'vitest'
import { createApiMock, type ApiMock } from '@/test/api-mock'
import { HttpStatus } from '@keimelion/sdk/enums'
import { buildStatusFilter, listUsers, resendStaffInvitation } from './admin-users.api'

describe('listUsers', () => {
  let mock: ApiMock
  let sentParams: unknown

  beforeEach(() => {
    mock = createApiMock()
    sentParams = undefined
    mock.onGet('/admin/users').reply((config) => {
      sentParams = config.params
      return [HttpStatus.OK, { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }]
    })
  })

  it('sends id, email, username and role as operator filters', async () => {
    await listUsers({
      page: 1,
      limit: 20,
      sort: 'createdAt:desc',
      id: '0b6f3c1e-1c1f-4f4e-9a55-3c5f0d7a2b11',
      email: 'alice',
      username: 'ali',
      role: 'moderator',
    })

    expect(sentParams).toEqual({
      page: '1',
      limit: '20',
      sort: 'createdAt:desc',
      'id[eq]': '0b6f3c1e-1c1f-4f4e-9a55-3c5f0d7a2b11',
      'email[ilike]': 'alice',
      'username[ilike]': 'ali',
      'role[eq]': 'moderator',
    })
  })

  it('omits empty filters', async () => {
    await listUsers({ page: 1, limit: 20, email: '', username: '' })

    expect(sentParams).toEqual({ page: '1', limit: '20' })
  })
})

const TEST_ORIGIN = 'http://localhost'

describe('buildStatusFilter', () => {
  it('returns no filter when no status is selected', () => {
    expect(buildStatusFilter([])).toEqual({})
  })

  it('uses the eq operator for a single status', () => {
    expect(buildStatusFilter(['invited'])).toEqual({ 'status[eq]': 'invited' })
  })

  it('uses the in operator for several statuses', () => {
    expect(buildStatusFilter(['invited', 'banned'])).toEqual({
      'status[in][]': ['invited', 'banned'],
    })
  })
})

describe('listUsers status filter', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
    mock.onGet('/admin/users').reply(HttpStatus.OK, {
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    })
  })

  function sentSearchParams(): URLSearchParams {
    const request = mock.history.get[0]
    if (request === undefined) throw new Error('No request sent')
    return new URL(request.url, TEST_ORIGIN).searchParams
  }

  it('sends status[eq] for a single status', async () => {
    await listUsers({ status: ['pending_deletion'] })

    expect(sentSearchParams().get('status[eq]')).toBe('pending_deletion')
    expect(sentSearchParams().has('status[in][]')).toBe(false)
  })

  it('sends one status[in][] entry per selected status', async () => {
    await listUsers({ status: ['invited', 'banned'] })

    expect(sentSearchParams().getAll('status[in][]')).toEqual(['invited', 'banned'])
    expect(sentSearchParams().has('status[eq]')).toBe(false)
  })

  it('sends no status filter by default so the API keeps hiding deleted accounts', async () => {
    await listUsers({ page: 1 })

    expect([...sentSearchParams().keys()].some((key) => key.startsWith('status'))).toBe(false)
  })
})

describe('resendStaffInvitation', () => {
  it('posts to the resend-invitation endpoint and returns the user', async () => {
    const mock = createApiMock()
    mock.onPost('/admin/users/0b6f3c1e-1c1f-4f4e-9a55-3c5f0d7a2b11/resend-invitation').reply(
      HttpStatus.OK,
      { user: INVITED_USER_WIRE },
    )

    const user = await resendStaffInvitation('0b6f3c1e-1c1f-4f4e-9a55-3c5f0d7a2b11')

    expect(user.status).toBe('invited')
    expect(mock.history.post).toHaveLength(1)
  })
})

const INVITED_USER_WIRE = {
  id: '0b6f3c1e-1c1f-4f4e-9a55-3c5f0d7a2b11',
  email: 'invited@keimelion.app',
  username: null,
  authProvider: 'email',
  role: 'moderator',
  avatarImageId: null,
  avatar: null,
  isCgvAccepted: false,
  cgvAcceptedAt: null,
  isMarketingOptedIn: false,
  defaultCurrency: 'EUR',
  emailVerifiedAt: null,
  lastActiveAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  bannedAt: null,
  banReason: null,
  deletedAt: null,
  activatedAt: null,
  status: 'invited',
  reservationsCount: 0,
}
