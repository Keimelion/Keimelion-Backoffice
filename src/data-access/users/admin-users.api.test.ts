import { beforeEach, describe, expect, it } from 'vitest'
import { createApiMock, type ApiMock } from '@/test/api-mock'
import { HttpStatus } from '@keimelion/sdk/enums'
import { listUsers } from './admin-users.api'

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
