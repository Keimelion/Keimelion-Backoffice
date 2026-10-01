import { describe, expect, it, vi, beforeEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { axiosInstance } from '@/data-access/_shared/axios'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import {
  apiAdminItemSchema,
  adminItemListResponseSchema,
  createItemInputSchema,
  listItemsQuerySchema,
  updateItemInputSchema,
} from './items.schemas'
import {
  createItem,
  deleteItem,
  fetchAdminItem,
  listAdminItems,
  updateItem,
} from './items.api'

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

const MOCK_ITEM = {
  id: 'item-1',
  name: 'Blanket',
  description: null,
  imageUrl: null,
  createdByUserId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  sources: [MOCK_SOURCE],
}

describe('apiAdminItemSchema', () => {
  it('parses a full item with sources', () => {
    const result = apiAdminItemSchema.safeParse(MOCK_ITEM)
    expect(result.success).toBe(true)
  })

  it('fails when sources is missing', () => {
    const result = apiAdminItemSchema.safeParse({ ...MOCK_ITEM, sources: undefined })
    expect(result.success).toBe(false)
  })
})

describe('adminItemListResponseSchema', () => {
  it('parses a valid list response', () => {
    const raw = {
      items: [MOCK_ITEM],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    }
    const result = adminItemListResponseSchema.safeParse(raw)
    expect(result.success).toBe(true)
  })
})

describe('listItemsQuerySchema', () => {
  it('applies defaults for page and limit', () => {
    const result = listItemsQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.page).toBe(1)
    expect(result.data.limit).toBe(20)
  })

  it('accepts a valid sort', () => {
    const result = listItemsQuerySchema.safeParse({ sort: 'name:asc' })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown sort field', () => {
    const result = listItemsQuerySchema.safeParse({ sort: 'description:asc' })
    expect(result.success).toBe(false)
  })
})

describe('createItemInputSchema', () => {
  const VALID_SOURCE = {
    shopId: null,
    sourceUrl: 'https://example.com/p',
    price: '19.99',
    currency: 'EUR',
  }

  const VALID_INPUT = {
    name: 'Blanket',
    description: null,
    imageUrl: null,
    sources: [VALID_SOURCE],
  }

  it('parses a valid input', () => {
    const result = createItemInputSchema.safeParse(VALID_INPUT)
    expect(result.success).toBe(true)
  })

  it('requires at least one source', () => {
    const result = createItemInputSchema.safeParse({ ...VALID_INPUT, sources: [] })
    expect(result.success).toBe(false)
  })

  it('rejects an HTTP-only image URL', () => {
    const result = createItemInputSchema.safeParse({ ...VALID_INPUT, imageUrl: 'http://example.com/x.jpg' })
    expect(result.success).toBe(false)
  })

  it('rejects an HTTP-only source URL', () => {
    const result = createItemInputSchema.safeParse({
      ...VALID_INPUT,
      sources: [{ ...VALID_SOURCE, sourceUrl: 'http://insecure.com/p' }],
    })
    expect(result.success).toBe(false)
  })

  it('rejects an unknown field (strict)', () => {
    const result = createItemInputSchema.safeParse({ ...VALID_INPUT, unknown: 'x' })
    expect(result.success).toBe(false)
  })
})

describe('updateItemInputSchema', () => {
  it('accepts partial updates', () => {
    const result = updateItemInputSchema.safeParse({ name: 'New' })
    expect(result.success).toBe(true)
  })

  it('rejects a sources field', () => {
    const result = updateItemInputSchema.safeParse({
      sources: [{ shopId: null, sourceUrl: null, price: null, currency: 'EUR' }],
    })
    expect(result.success).toBe(false)
  })
})

describe('listAdminItems', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
    vi.clearAllMocks()
  })

  it('sends pagination, search and sort in the request', async () => {
    mock.onGet('/admin/items').reply((config) => {
      expect(config.params).toEqual({
        page: '2',
        limit: '10',
        'name[ilike]': 'blanket',
        sort: 'name:asc',
      })
      return [
        HttpStatus.OK,
        {
          items: [MOCK_ITEM],
          pagination: { page: 2, limit: 10, total: 1, totalPages: 1 },
        },
      ]
    })

    const response = await listAdminItems({
      page: 2,
      limit: 10,
      search: 'blanket',
      sort: 'name:asc',
    })

    expect(response.items).toHaveLength(1)
  })

  it('omits optional params when not set', async () => {
    mock.onGet('/admin/items').reply((config) => {
      expect(config.params).toEqual({ page: '1', limit: '20' })
      return [
        HttpStatus.OK,
        {
          items: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
      ]
    })

    await listAdminItems({ page: 1, limit: 20 })
  })
})

describe('fetchAdminItem', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  it('returns the item on success', async () => {
    mock.onGet('/admin/items/item-1').reply(HttpStatus.OK, { item: MOCK_ITEM })
    const item = await fetchAdminItem('item-1')
    expect(item.id).toBe('item-1')
  })
})

describe('createItem', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  it('returns the created item on success', async () => {
    mock.onPost('/admin/items').reply(HttpStatus.CREATED, { item: MOCK_ITEM })
    const item = await createItem({
      name: 'Blanket',
      description: null,
      imageUrl: null,
      sources: [{ shopId: null, sourceUrl: null, price: null, currency: 'EUR' }],
    })
    expect(item.name).toBe('Blanket')
  })

  it('throws ApiRequestError on 422', async () => {
    mock.onPost('/admin/items').reply(HttpStatus.UNPROCESSABLE_ENTITY, {
      code: 'UNPROCESSABLE_ENTITY',
      message: 'Validation failed',
    })
    await expect(
      createItem({
        name: 'x',
        description: null,
        imageUrl: null,
        sources: [{ shopId: null, sourceUrl: null, price: null, currency: 'EUR' }],
      }),
    ).rejects.toBeInstanceOf(ApiRequestError)
  })
})

describe('updateItem', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  it('returns the updated item on success', async () => {
    mock.onPatch('/admin/items/item-1').reply(HttpStatus.OK, {
      item: { ...MOCK_ITEM, name: 'Renamed' },
    })
    const item = await updateItem('item-1', { name: 'Renamed' })
    expect(item.name).toBe('Renamed')
  })

  it('throws ApiRequestError on 404', async () => {
    mock.onPatch('/admin/items/missing').reply(HttpStatus.NOT_FOUND, {
      code: 'NOT_FOUND',
      message: 'Not found',
    })
    await expect(updateItem('missing', { name: 'x' })).rejects.toBeInstanceOf(ApiRequestError)
  })
})

describe('deleteItem', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  it('resolves on 200', async () => {
    mock.onDelete('/admin/items/item-1').reply(HttpStatus.OK, { message: 'Item deleted' })
    await expect(deleteItem('item-1')).resolves.toBeUndefined()
  })

  it('throws ApiRequestError on 409', async () => {
    mock.onDelete('/admin/items/item-1').reply(HttpStatus.CONFLICT, {
      code: 'CONFLICT',
      message: 'Item referenced by list_items',
    })
    await expect(deleteItem('item-1')).rejects.toBeInstanceOf(ApiRequestError)
  })
})
