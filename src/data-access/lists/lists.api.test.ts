import { describe, expect, it, beforeEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { axiosInstance } from '@/data-access/_shared/axios'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import {
  apiAdminListSchema,
  adminListListResponseSchema,
  listListsQuerySchema,
  updateListInputSchema,
} from './lists.schemas'
import {
  deleteList,
  fetchAdminList,
  listAdminListItems,
  listAdminLists,
  restoreList,
  updateList,
} from './lists.api'

const LIST_ID = '11111111-1111-4111-8111-111111111111'
const OWNER_ID = '22222222-2222-4222-8222-222222222222'
const OCCASION_TYPE_ID = '33333333-3333-4333-8333-333333333333'

const MOCK_OWNER = {
  id: OWNER_ID,
  email: 'owner@example.com',
  username: 'owner',
  authProvider: 'email' as const,
  role: 'user' as const,
  avatarUrl: null,
  isCgvAccepted: true,
  cgvAcceptedAt: null,
  isMarketingOptedIn: false,
  emailVerifiedAt: null,
  lastActiveAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const MOCK_LIST = {
  id: LIST_ID,
  title: 'Birthday',
  slug: 'birthday',
  description: null,
  listStatus: 'active' as const,
  occasionTypeId: OCCASION_TYPE_ID,
  owner: MOCK_OWNER,
  tags: [],
  itemCount: 3,
  totalEstimatedPrice: '42.00',
  deletedAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const MOCK_SOURCE = {
  id: 'src-1',
  itemId: 'item-1',
  shopId: null,
  shop: null,
  sourceUrl: 'https://example.com/p',
  price: '19.99',
  currency: 'EUR',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const MOCK_LIST_ITEM = {
  id: 'li-1',
  listId: LIST_ID,
  itemId: 'item-1',
  quantityDesired: 1,
  quantityReservedTotal: 0,
  itemStatus: 'active',
  sortOrder: 0,
  creatorNote: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  item: {
    id: 'item-1',
    name: 'Blanket',
    description: null,
    imageUrl: null,
    createdByUserId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  sources: [MOCK_SOURCE],
}

describe('apiAdminListSchema', () => {
  it('parses a full list with aggregates', () => {
    const result = apiAdminListSchema.safeParse(MOCK_LIST)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.itemCount).toBe(3)
    expect(result.data.totalEstimatedPrice).toBe('42.00')
  })

  it('fails when itemCount is missing', () => {
    const result = apiAdminListSchema.safeParse({ ...MOCK_LIST, itemCount: undefined })
    expect(result.success).toBe(false)
  })

  it('accepts a null totalEstimatedPrice', () => {
    const result = apiAdminListSchema.safeParse({ ...MOCK_LIST, totalEstimatedPrice: null })
    expect(result.success).toBe(true)
  })

  it('defaults tags to an empty array when the API omits it', () => {
    const payload: Record<string, unknown> = { ...MOCK_LIST }
    delete payload.tags
    const result = apiAdminListSchema.safeParse(payload)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.tags).toEqual([])
  })
})

describe('adminListListResponseSchema', () => {
  it('parses a valid list response', () => {
    const raw = {
      items: [MOCK_LIST],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    }
    const result = adminListListResponseSchema.safeParse(raw)
    expect(result.success).toBe(true)
  })
})

describe('listListsQuerySchema', () => {
  it('applies defaults for page and limit', () => {
    const result = listListsQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.page).toBe(1)
    expect(result.data.limit).toBe(20)
  })

  it('accepts a valid sort', () => {
    const result = listListsQuerySchema.safeParse({ sort: 'createdAt:desc' })
    expect(result.success).toBe(true)
  })

  it('rejects a sort on a non-sortable field', () => {
    const result = listListsQuerySchema.safeParse({ sort: 'listStatus:asc' })
    expect(result.success).toBe(false)
  })

  it('accepts a listStatus filter', () => {
    const result = listListsQuerySchema.safeParse({ listStatus: 'active' })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown listStatus', () => {
    const result = listListsQuerySchema.safeParse({ listStatus: 'unknown' })
    expect(result.success).toBe(false)
  })

  it('rejects a non-UUID ownerUserId', () => {
    const result = listListsQuerySchema.safeParse({ ownerUserId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })
})

describe('updateListInputSchema', () => {
  it('accepts a partial update', () => {
    const result = updateListInputSchema.safeParse({ title: 'Renamed' })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown field (strict)', () => {
    const result = updateListInputSchema.safeParse({ title: 'x', unknown: 'y' })
    expect(result.success).toBe(false)
  })

  it('rejects a title that is too long', () => {
    const result = updateListInputSchema.safeParse({ title: 'x'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('accepts a null occasionTypeId', () => {
    const result = updateListInputSchema.safeParse({ occasionTypeId: null })
    expect(result.success).toBe(true)
  })

  it('accepts a tags array', () => {
    const result = updateListInputSchema.safeParse({ tags: ['family', 'birthday'] })
    expect(result.success).toBe(true)
  })

  it('rejects more than the max number of tags', () => {
    const result = updateListInputSchema.safeParse({
      tags: Array.from({ length: 21 }, (_, index) => `tag-${String(index)}`),
    })
    expect(result.success).toBe(false)
  })
})

describe('listAdminLists', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  it('sends pagination, search, filters and sort in the request', async () => {
    mock.onGet('/admin/lists').reply((config) => {
      expect(config.params).toEqual({
        page: '2',
        limit: '10',
        'title[ilike]': 'birthday',
        'listStatus[eq]': 'active',
        'occasionTypeId[eq]': OCCASION_TYPE_ID,
        ownerUserId: OWNER_ID,
        sort: 'createdAt:desc',
      })
      return [
        HttpStatus.OK,
        {
          items: [MOCK_LIST],
          pagination: { page: 2, limit: 10, total: 1, totalPages: 1 },
        },
      ]
    })

    const response = await listAdminLists({
      page: 2,
      limit: 10,
      search: 'birthday',
      listStatus: 'active',
      occasionTypeId: OCCASION_TYPE_ID,
      ownerUserId: OWNER_ID,
      sort: 'createdAt:desc',
    })

    expect(response.items).toHaveLength(1)
  })

  it('omits optional params when not set', async () => {
    mock.onGet('/admin/lists').reply((config) => {
      expect(config.params).toEqual({ page: '1', limit: '20' })
      return [
        HttpStatus.OK,
        {
          items: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
      ]
    })

    await listAdminLists({ page: 1, limit: 20 })
  })
})

describe('fetchAdminList', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  it('returns the list on success', async () => {
    mock.onGet(`/admin/lists/${LIST_ID}`).reply(HttpStatus.OK, { list: MOCK_LIST })
    const list = await fetchAdminList(LIST_ID)
    expect(list.id).toBe(LIST_ID)
  })

  it('throws ApiRequestError on 404', async () => {
    mock.onGet(`/admin/lists/${LIST_ID}`).reply(HttpStatus.NOT_FOUND, {
      code: 'NOT_FOUND',
      message: 'Not found',
    })
    await expect(fetchAdminList(LIST_ID)).rejects.toBeInstanceOf(ApiRequestError)
  })
})

describe('updateList', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  it('returns the updated list on success', async () => {
    mock.onPatch(`/admin/lists/${LIST_ID}`).reply(HttpStatus.OK, {
      list: { ...MOCK_LIST, title: 'Renamed' },
    })
    const list = await updateList(LIST_ID, { title: 'Renamed' })
    expect(list.title).toBe('Renamed')
  })

  it('forwards the patch body as-is', async () => {
    mock.onPatch(`/admin/lists/${LIST_ID}`).reply((config) => {
      const parsed = JSON.parse(config.data as string) as { title: string; tags: string[] }
      expect(parsed).toEqual({ title: 'Renamed', tags: ['family'] })
      return [HttpStatus.OK, { list: MOCK_LIST }]
    })
    await updateList(LIST_ID, { title: 'Renamed', tags: ['family'] })
  })

  it('throws ApiRequestError on 422', async () => {
    mock.onPatch(`/admin/lists/${LIST_ID}`).reply(HttpStatus.UNPROCESSABLE_ENTITY, {
      code: 'UNPROCESSABLE_ENTITY',
      message: 'Validation failed',
      metadata: { issues: [{ path: 'title', message: 'Required', code: 'invalid_type' }] },
    })
    await expect(updateList(LIST_ID, { title: '' })).rejects.toBeInstanceOf(ApiRequestError)
  })
})

describe('deleteList', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  it('resolves on 204', async () => {
    mock.onDelete(`/admin/lists/${LIST_ID}`).reply(HttpStatus.NO_CONTENT)
    await expect(deleteList(LIST_ID)).resolves.toBeUndefined()
  })

  it('throws ApiRequestError on 404', async () => {
    mock.onDelete(`/admin/lists/${LIST_ID}`).reply(HttpStatus.NOT_FOUND, {
      code: 'NOT_FOUND',
      message: 'Not found',
    })
    await expect(deleteList(LIST_ID)).rejects.toBeInstanceOf(ApiRequestError)
  })
})

describe('restoreList', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  it('returns the restored list on success', async () => {
    mock.onPost(`/admin/lists/${LIST_ID}/restore`).reply(HttpStatus.OK, { list: MOCK_LIST })
    const list = await restoreList(LIST_ID)
    expect(list.id).toBe(LIST_ID)
  })

  it('throws ApiRequestError on 404', async () => {
    mock.onPost(`/admin/lists/${LIST_ID}/restore`).reply(HttpStatus.NOT_FOUND, {
      code: 'NOT_FOUND',
      message: 'Not found',
    })
    await expect(restoreList(LIST_ID)).rejects.toBeInstanceOf(ApiRequestError)
  })
})

describe('listAdminListItems', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  it('sends the pagination params and parses the response', async () => {
    mock.onGet(`/admin/lists/${LIST_ID}/items`).reply((config) => {
      expect(config.params).toEqual({ page: '1', limit: '20' })
      return [
        HttpStatus.OK,
        {
          items: [MOCK_LIST_ITEM],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        },
      ]
    })

    const response = await listAdminListItems(LIST_ID, { page: 1, limit: 20 })
    expect(response.items).toHaveLength(1)
    expect(response.items[0]?.item.name).toBe('Blanket')
    expect(response.items[0]?.sources).toHaveLength(1)
  })

  it('throws ApiRequestError on 404', async () => {
    mock.onGet(`/admin/lists/${LIST_ID}/items`).reply(HttpStatus.NOT_FOUND, {
      code: 'NOT_FOUND',
      message: 'Not found',
    })
    await expect(listAdminListItems(LIST_ID, { page: 1, limit: 20 })).rejects.toBeInstanceOf(
      ApiRequestError,
    )
  })
})
