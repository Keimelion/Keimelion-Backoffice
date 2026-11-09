import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createApiMock, type ApiMock } from '@/test/api-mock'
import { HttpStatus } from '@keimelion/sdk/enums'
import {
  createShop,
  deleteShop,
  listAdminShops,
  updateShop,
} from './admin-shops.api'
import { ApiError } from '@keimelion/sdk/client'

const MOCK_SHOP = {
  id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  slug: 'amazon',
  name: 'Amazon',
  domain: 'amazon.com',
  logoUrl: 'https://cdn.example.com/amazon.png',
  isAffiliated: false,
  sortOrder: 0,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('listAdminShops', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
    vi.clearAllMocks()
  })

  it('sends pagination, filters and sort in the request', async () => {
    mock.onGet('/admin/shops').reply((config) => {
      expect(config.params).toEqual({
        page: '2',
        limit: '10',
        'name[ilike]': 'amazon',
        'isActive[eq]': 'true',
        'isAffiliated[eq]': 'false',
        sort: 'name:asc',
      })
      return [
        HttpStatus.OK,
        {
          items: [MOCK_SHOP],
          pagination: { page: 2, limit: 10, total: 1, totalPages: 1 },
        },
      ]
    })

    const response = await listAdminShops({
      page: 2,
      limit: 10,
      search: 'amazon',
      isActive: true,
      isAffiliated: false,
      sort: 'name:asc',
    })

    expect(response.items).toHaveLength(1)
  })

  it('omits filters when not set', async () => {
    mock.onGet('/admin/shops').reply((config) => {
      expect(config.params).toEqual({ page: '1', limit: '20' })
      return [
        HttpStatus.OK,
        {
          items: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
      ]
    })

    await listAdminShops({ page: 1, limit: 20 })
  })

})

describe('createShop', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('returns the created shop on success', async () => {
    mock.onPost('/admin/shops').reply(HttpStatus.CREATED, { shop: MOCK_SHOP })
    const shop = await createShop({
      slug: 'amazon',
      name: 'Amazon',
      domain: 'amazon.com',
      logoUrl: 'https://cdn.example.com/amazon.png',
      isAffiliated: false,
      sortOrder: 0,
      isActive: true,
    })
    expect(shop.slug).toBe('amazon')
  })

  it('throws ApiError on 409', async () => {
    mock.onPost('/admin/shops').reply(HttpStatus.CONFLICT, {
      code: 'CONFLICT',
      message: 'Shop already exists',
    })
    await expect(
      createShop({
        slug: 'amazon',
        name: 'Amazon',
        domain: null,
        logoUrl: null,
        isAffiliated: false,
        sortOrder: 0,
        isActive: true,
      }),
    ).rejects.toBeInstanceOf(ApiError)
  })
})

describe('updateShop', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('returns the updated shop on success', async () => {
    mock.onPatch('/admin/shops/cccccccc-cccc-4ccc-8ccc-cccccccccccc').reply(HttpStatus.OK, {
      shop: { ...MOCK_SHOP, name: 'Renamed' },
    })
    const shop = await updateShop('cccccccc-cccc-4ccc-8ccc-cccccccccccc', { name: 'Renamed' })
    expect(shop.name).toBe('Renamed')
  })

  it('throws ApiError on 404', async () => {
    mock.onPatch('/admin/shops/missing').reply(HttpStatus.NOT_FOUND, {
      code: 'NOT_FOUND',
      message: 'Not found',
    })
    await expect(updateShop('missing', { name: 'x' })).rejects.toBeInstanceOf(ApiError)
  })

  it('throws ApiError on 409', async () => {
    mock.onPatch('/admin/shops/cccccccc-cccc-4ccc-8ccc-cccccccccccc').reply(HttpStatus.CONFLICT, {
      code: 'CONFLICT',
      message: 'Domain already exists',
    })
    await expect(updateShop('cccccccc-cccc-4ccc-8ccc-cccccccccccc', { domain: 'x.com' })).rejects.toBeInstanceOf(ApiError)
  })
})

describe('deleteShop', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('resolves on 204', async () => {
    mock.onDelete('/admin/shops/cccccccc-cccc-4ccc-8ccc-cccccccccccc').reply(HttpStatus.NO_CONTENT)
    await expect(deleteShop('cccccccc-cccc-4ccc-8ccc-cccccccccccc')).resolves.toBeUndefined()
  })

  it('throws ApiError on 404', async () => {
    mock.onDelete('/admin/shops/missing').reply(HttpStatus.NOT_FOUND, {
      code: 'NOT_FOUND',
      message: 'Not found',
    })
    await expect(deleteShop('missing')).rejects.toBeInstanceOf(ApiError)
  })
})
