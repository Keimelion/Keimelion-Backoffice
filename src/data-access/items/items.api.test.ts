import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createApiMock, type ApiMock } from '@/test/api-mock'
import { HttpStatus } from '@keimelion/sdk/enums'
import {
  createItem,
  deleteItem,
  fetchAdminItem,
  listAdminItems,
  updateItem,
} from './items.api'
import { ApiError } from '@keimelion/sdk/client'

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

const MOCK_CATEGORY = {
  id: '11111111-1111-4111-8111-111111111111',
  parentId: null,
  name: 'Food',
  slug: 'food',
  depth: 0,
}

const MOCK_ITEM = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  name: 'Blanket',
  description: null,
  imageId: null,
  image: null,
  createdByUserId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  sources: [MOCK_SOURCE],
  categories: [MOCK_CATEGORY],
  tags: [],
  reservationCount: 0,
}

describe('listAdminItems', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
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
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('returns the item on success', async () => {
    mock.onGet('/admin/items/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa').reply(HttpStatus.OK, { item: MOCK_ITEM })
    const item = await fetchAdminItem('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')
    expect(item.id).toBe('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')
  })
})

describe('createItem', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('returns the created item on success', async () => {
    mock.onPost('/admin/items').reply(HttpStatus.CREATED, { item: MOCK_ITEM })
    const item = await createItem({
      name: 'Blanket',
      description: null,
      sources: [{ shopId: null, sourceUrl: null, price: null }],
    }, null)
    expect(item.name).toBe('Blanket')
  })

  it('forwards selected categories in the request body', async () => {
    const CATEGORY_ONE = '11111111-1111-4111-8111-111111111111'
    const CATEGORY_TWO = '22222222-2222-4222-8222-222222222222'
    mock.onPost('/admin/items').reply((config) => {
      const parsed = JSON.parse(config.data as string) as { categories?: string[] }
      expect(parsed.categories).toEqual([CATEGORY_ONE, CATEGORY_TWO])
      return [HttpStatus.CREATED, { item: MOCK_ITEM }]
    })
    await createItem({
      name: 'Blanket',
      description: null,
      sources: [{ shopId: null, sourceUrl: null, price: null }],
      categories: [CATEGORY_ONE, CATEGORY_TWO],
    }, null)
  })

  it('throws ApiError on 422', async () => {
    mock.onPost('/admin/items').reply(HttpStatus.UNPROCESSABLE_ENTITY, {
      code: 'UNPROCESSABLE_ENTITY',
      message: 'Validation failed',
    })
    await expect(
      createItem({
        name: 'x',
        description: null,
        sources: [{ shopId: null, sourceUrl: null, price: null }],
      }, null),
    ).rejects.toBeInstanceOf(ApiError)
  })
})

describe('createItem with an image file', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('sends multipart form data with JSON-encoded sources and the image field', async () => {
    const image = new File(['content'], 'item.png', { type: 'image/png' })
    mock.onPost('/admin/items').reply((config) => {
      const formData = config.data as FormData
      expect(formData.get('name')).toBe('Blanket')
      expect(JSON.parse(formData.get('sources') as string)).toEqual([
        { shopId: null, sourceUrl: 'https://example.com/p', price: null, currency: 'EUR' },
      ])
      expect(formData.get('description')).toBeNull()
      expect(formData.get('image')).toBeInstanceOf(File)
      return [HttpStatus.CREATED, { item: MOCK_ITEM }]
    })

    await createItem(
      {
        name: 'Blanket',
        description: null,
        sources: [{ shopId: null, sourceUrl: 'https://example.com/p', price: null, currency: 'EUR' }],
      },
      image,
    )
  })
})

describe('updateItem with an image file', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('sends multipart form data and encodes a null description as an empty string', async () => {
    const image = new File(['content'], 'item.png', { type: 'image/png' })
    mock.onPatch(`/admin/items/${MOCK_ITEM.id}`).reply((config) => {
      const formData = config.data as FormData
      expect(formData.get('description')).toBe('')
      expect(formData.get('image')).toBeInstanceOf(File)
      expect(formData.get('clearImage')).toBeNull()
      return [HttpStatus.OK, { item: MOCK_ITEM }]
    })

    await updateItem(MOCK_ITEM.id, { description: null }, image)
  })

  it('sends clearImage as JSON when no file is selected', async () => {
    mock.onPatch(`/admin/items/${MOCK_ITEM.id}`).reply((config) => {
      expect(JSON.parse(config.data as string)).toEqual({ clearImage: true })
      return [HttpStatus.OK, { item: MOCK_ITEM }]
    })

    await updateItem(MOCK_ITEM.id, { clearImage: true }, null)
  })
})

describe('updateItem', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('returns the updated item on success', async () => {
    mock.onPatch('/admin/items/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa').reply(HttpStatus.OK, {
      item: { ...MOCK_ITEM, name: 'Renamed' },
    })
    const item = await updateItem('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', { name: 'Renamed' }, null)
    expect(item.name).toBe('Renamed')
  })

  it('throws ApiError on 404', async () => {
    mock.onPatch('/admin/items/missing').reply(HttpStatus.NOT_FOUND, {
      code: 'NOT_FOUND',
      message: 'Not found',
    })
    await expect(updateItem('missing', { name: 'x' }, null)).rejects.toBeInstanceOf(ApiError)
  })

  it('forwards an empty categories array for "remove all"', async () => {
    mock.onPatch('/admin/items/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa').reply((config) => {
      const parsed = JSON.parse(config.data as string) as { categories?: string[] }
      expect(parsed.categories).toEqual([])
      return [HttpStatus.OK, { item: MOCK_ITEM }]
    })
    await updateItem('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', { categories: [] }, null)
  })
})

describe('deleteItem', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('resolves on 200', async () => {
    mock.onDelete('/admin/items/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa').reply(HttpStatus.OK, { message: 'Item deleted' })
    await expect(deleteItem('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')).resolves.toBeUndefined()
  })

  it('throws ApiError on 409', async () => {
    mock.onDelete('/admin/items/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa').reply(HttpStatus.CONFLICT, {
      code: 'CONFLICT',
      message: 'Item referenced by list_items',
    })
    await expect(deleteItem('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')).rejects.toBeInstanceOf(ApiError)
  })
})
