import { afterEach, describe, expect, it, beforeEach } from 'vitest'
import { useCurrencyStore } from '@/lib/i18n/currency-store'
import { createApiMock, type ApiMock } from '@/test/api-mock'
import { HttpStatus } from '@keimelion/sdk/enums'
import {
  deleteList,
  fetchAdminList,
  listAdminListItems,
  listAdminLists,
  restoreList,
  updateList,
} from './lists.api'
import { ApiError } from '@keimelion/sdk/client'

const LIST_ID = '11111111-1111-4111-8111-111111111111'
const OWNER_ID = '22222222-2222-4222-8222-222222222222'
const OCCASION_TYPE_ID = '33333333-3333-4333-8333-333333333333'

const MOCK_OWNER = {
  id: OWNER_ID,
  email: 'owner@example.com',
  username: 'owner',
  authProvider: 'email' as const,
  role: 'user' as const,
  avatarImageId: null,
  avatar: null,
  defaultCurrency: 'EUR' as const,
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
  displayCurrency: 'EUR' as const,
  deletedAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const MOCK_SOURCE = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  itemId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  shopId: null,
  shop: null,
  sourceUrl: 'https://example.com/p',
  price: '19.99',
  currency: 'EUR',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const MOCK_LIST_ITEM = {
  id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  listId: LIST_ID,
  itemId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  quantityDesired: 1,
  quantityReservedTotal: 0,
  itemStatus: 'available' as const,
  sortOrder: 0,
  creatorNote: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  item: {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    name: 'Blanket',
    description: null,
    imageId: null,
    image: null,
    createdByUserId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    sources: [],
    categories: [],
    tags: [],
  },
  sources: [MOCK_SOURCE],
  averagePrice: '19.99',
  displayCurrency: 'EUR' as const,
}

describe('display currency', () => {
  let mock: ApiMock

  beforeEach(() => {
    useCurrencyStore.setState({ currency: 'JPY' })
    mock = createApiMock()
  })

  afterEach(() => {
    useCurrencyStore.setState({ currency: 'EUR' })
    mock.restore()
  })

  it('sends the store currency on the admin lists list route', async () => {
    mock.onGet('/admin/lists').reply(HttpStatus.OK, {
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    })

    await listAdminLists({ page: 1, limit: 20 })

    expect(mock.history.get[0]?.params.currency).toBe('JPY')
  })

  it('sends the store currency on the admin list detail route', async () => {
    mock.onGet(`/admin/lists/${LIST_ID}`).reply(HttpStatus.OK, { list: MOCK_LIST })

    await fetchAdminList(LIST_ID)

    expect(mock.history.get[0]?.params.currency).toBe('JPY')
  })

  it('sends the store currency on the admin list items route', async () => {
    mock.onGet(`/admin/lists/${LIST_ID}/items`).reply(HttpStatus.OK, {
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    })

    await listAdminListItems(LIST_ID, { page: 1, limit: 20 })

    expect(mock.history.get[0]?.params.currency).toBe('JPY')
  })
})

describe('listAdminLists', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
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
        currency: 'EUR',
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
      expect(config.params).toEqual({ page: '1', limit: '20', currency: 'EUR' })
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
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('returns the list on success', async () => {
    mock.onGet(`/admin/lists/${LIST_ID}`).reply(HttpStatus.OK, { list: MOCK_LIST })
    const list = await fetchAdminList(LIST_ID)
    expect(list.id).toBe(LIST_ID)
  })

  it('throws ApiError on 404', async () => {
    mock.onGet(`/admin/lists/${LIST_ID}`).reply(HttpStatus.NOT_FOUND, {
      code: 'NOT_FOUND',
      message: 'Not found',
    })
    await expect(fetchAdminList(LIST_ID)).rejects.toBeInstanceOf(ApiError)
  })
})

describe('updateList', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
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

  it('throws ApiError on 422', async () => {
    mock.onPatch(`/admin/lists/${LIST_ID}`).reply(HttpStatus.UNPROCESSABLE_ENTITY, {
      code: 'UNPROCESSABLE_ENTITY',
      message: 'Validation failed',
      metadata: { issues: [{ path: 'title', message: 'Required', code: 'invalid_type' }] },
    })
    await expect(updateList(LIST_ID, { title: '' })).rejects.toBeInstanceOf(ApiError)
  })
})

describe('deleteList', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('resolves on 204', async () => {
    mock.onDelete(`/admin/lists/${LIST_ID}`).reply(HttpStatus.NO_CONTENT)
    await expect(deleteList(LIST_ID)).resolves.toBeUndefined()
  })

  it('throws ApiError on 404', async () => {
    mock.onDelete(`/admin/lists/${LIST_ID}`).reply(HttpStatus.NOT_FOUND, {
      code: 'NOT_FOUND',
      message: 'Not found',
    })
    await expect(deleteList(LIST_ID)).rejects.toBeInstanceOf(ApiError)
  })
})

describe('restoreList', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('returns the restored list on success', async () => {
    mock.onPost(`/admin/lists/${LIST_ID}/restore`).reply(HttpStatus.OK, { list: MOCK_LIST })
    const list = await restoreList(LIST_ID)
    expect(list.id).toBe(LIST_ID)
  })

  it('throws ApiError on 404', async () => {
    mock.onPost(`/admin/lists/${LIST_ID}/restore`).reply(HttpStatus.NOT_FOUND, {
      code: 'NOT_FOUND',
      message: 'Not found',
    })
    await expect(restoreList(LIST_ID)).rejects.toBeInstanceOf(ApiError)
  })
})

describe('listAdminListItems', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('sends the pagination params and parses the response', async () => {
    mock.onGet(`/admin/lists/${LIST_ID}/items`).reply((config) => {
      expect(config.params).toEqual({ page: '1', limit: '20', currency: 'EUR' })
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

  it('throws ApiError on 404', async () => {
    mock.onGet(`/admin/lists/${LIST_ID}/items`).reply(HttpStatus.NOT_FOUND, {
      code: 'NOT_FOUND',
      message: 'Not found',
    })
    await expect(listAdminListItems(LIST_ID, { page: 1, limit: 20 })).rejects.toBeInstanceOf(
      ApiError,
    )
  })
})
