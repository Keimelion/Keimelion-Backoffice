import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createApiMock, type ApiMock } from '@/test/api-mock'
import { HttpStatus } from '@keimelion/sdk/enums'
import {
  createTag,
  deleteTag,
  listAdminTags,
  updateTag,
} from './tags.api'
import { ApiError } from '@keimelion/sdk/client'

const MOCK_TAG = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'gaming',
  slug: 'gaming',
  createdByUserId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('listAdminTags', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
    vi.clearAllMocks()
  })

  it('sends pagination, search and the default sort', async () => {
    mock.onGet('/admin/tags').reply((config) => {
      expect(config.params).toEqual({
        page: '2',
        limit: '10',
        'name[ilike]': 'gam',
        sort: 'createdAt:desc',
      })
      return [
        HttpStatus.OK,
        {
          items: [MOCK_TAG],
          pagination: { page: 2, limit: 10, total: 1, totalPages: 1 },
        },
      ]
    })

    const response = await listAdminTags({
      page: 2,
      limit: 10,
      search: 'gam',
    })

    expect(response.items).toHaveLength(1)
    expect(response.items[0]?.slug).toBe('gaming')
  })

  it('omits search when not provided', async () => {
    mock.onGet('/admin/tags').reply((config) => {
      expect(config.params).toEqual({ page: '1', limit: '20', sort: 'createdAt:desc' })
      return [
        HttpStatus.OK,
        { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
      ]
    })

    await listAdminTags({ page: 1, limit: 20 })
  })
})

describe('createTag', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('returns the created tag on success', async () => {
    mock.onPost('/admin/tags').reply((config) => {
      expect(JSON.parse(config.data as string)).toEqual({ name: 'Gaming', slug: 'gaming' })
      return [HttpStatus.CREATED, { tag: MOCK_TAG }]
    })
    const tag = await createTag({ name: 'Gaming', slug: 'gaming' })
    expect(tag.slug).toBe('gaming')
  })

  it('throws ApiError on 409 conflict', async () => {
    mock.onPost('/admin/tags').reply(HttpStatus.CONFLICT, {
      code: 'CONFLICT',
      message: 'Resource already exists',
    })
    await expect(createTag({ name: 'Gaming', slug: 'gaming' })).rejects.toBeInstanceOf(
      ApiError,
    )
  })
})

describe('updateTag', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('returns the updated tag on success', async () => {
    mock.onPatch(`/admin/tags/${MOCK_TAG.id}`).reply((config) => {
      expect(JSON.parse(config.data as string)).toEqual({ name: 'Renamed' })
      return [HttpStatus.OK, { tag: { ...MOCK_TAG, name: 'renamed', slug: 'renamed' } }]
    })
    const tag = await updateTag(MOCK_TAG.id, { name: 'Renamed' })
    expect(tag.slug).toBe('renamed')
  })

  it('throws ApiError on 409 conflict', async () => {
    mock.onPatch(`/admin/tags/${MOCK_TAG.id}`).reply(HttpStatus.CONFLICT, {
      code: 'CONFLICT',
      message: 'Resource already exists',
    })
    await expect(updateTag(MOCK_TAG.id, { name: 'Dup' })).rejects.toBeInstanceOf(ApiError)
  })
})

describe('deleteTag', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('resolves on 204', async () => {
    mock.onDelete(`/admin/tags/${MOCK_TAG.id}`).reply(HttpStatus.NO_CONTENT)
    await expect(deleteTag(MOCK_TAG.id)).resolves.toBeUndefined()
  })

  it('throws ApiError on 404', async () => {
    mock.onDelete('/admin/tags/missing').reply(HttpStatus.NOT_FOUND, {
      code: 'TAG_NOT_FOUND',
      message: 'Not found',
    })
    await expect(deleteTag('missing')).rejects.toBeInstanceOf(ApiError)
  })
})
