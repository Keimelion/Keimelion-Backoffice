import { describe, expect, it, vi, beforeEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { axiosInstance } from '@/data-access/_shared/axios'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import {
  adminShopSchema,
  adminShopListResponseSchema,
  createShopInputSchema,
  listShopsQuerySchema,
  updateShopInputSchema,
} from './admin-shops.schemas'
import {
  createShop,
  deleteShop,
  listAdminShops,
  updateShop,
} from './admin-shops.api'

const MOCK_SHOP = {
  id: 'shop-1',
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

describe('adminShopSchema', () => {
  it('parses a full shop object', () => {
    const result = adminShopSchema.safeParse(MOCK_SHOP)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.slug).toBe('amazon')
  })

  it('parses a shop with null domain and logoUrl', () => {
    const result = adminShopSchema.safeParse({ ...MOCK_SHOP, domain: null, logoUrl: null })
    expect(result.success).toBe(true)
  })

  it('fails when required fields are missing', () => {
    const result = adminShopSchema.safeParse({ id: 'shop-1' })
    expect(result.success).toBe(false)
  })
})

describe('adminShopListResponseSchema', () => {
  it('parses a valid list response', () => {
    const raw = {
      items: [MOCK_SHOP],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    }
    const result = adminShopListResponseSchema.safeParse(raw)
    expect(result.success).toBe(true)
  })

  it('parses an empty list', () => {
    const raw = { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
    const result = adminShopListResponseSchema.safeParse(raw)
    expect(result.success).toBe(true)
  })

  it('fails when pagination is missing', () => {
    const result = adminShopListResponseSchema.safeParse({ items: [] })
    expect(result.success).toBe(false)
  })
})

describe('listShopsQuerySchema', () => {
  it('applies defaults for page and limit', () => {
    const result = listShopsQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.page).toBe(1)
    expect(result.data.limit).toBe(20)
  })

  it('coerces boolean string filters', () => {
    const result = listShopsQuerySchema.safeParse({
      isActive: 'true',
      isAffiliated: 'false',
    })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.isActive).toBe(true)
    expect(result.data.isAffiliated).toBe(false)
  })

  it('accepts a valid sort value', () => {
    const result = listShopsQuerySchema.safeParse({ sort: 'name:asc' })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.sort).toBe('name:asc')
  })

  it('rejects sort with an unknown field', () => {
    const result = listShopsQuerySchema.safeParse({ sort: 'domain:asc' })
    expect(result.success).toBe(false)
  })
})

describe('createShopInputSchema', () => {
  const VALID_INPUT = {
    slug: 'amazon',
    name: 'Amazon',
    domain: 'amazon.com',
    logoUrl: 'https://cdn.example.com/amazon.png',
    isAffiliated: false,
    sortOrder: 0,
    isActive: true,
  }

  it('parses a valid input', () => {
    const result = createShopInputSchema.safeParse(VALID_INPUT)
    expect(result.success).toBe(true)
  })

  it('accepts null domain and logoUrl', () => {
    const result = createShopInputSchema.safeParse({ ...VALID_INPUT, domain: null, logoUrl: null })
    expect(result.success).toBe(true)
  })

  it('rejects a slug with uppercase letters', () => {
    const result = createShopInputSchema.safeParse({ ...VALID_INPUT, slug: 'Amazon' })
    expect(result.success).toBe(false)
  })

  it('rejects an HTTP-only logo URL', () => {
    const result = createShopInputSchema.safeParse({ ...VALID_INPUT, logoUrl: 'http://cdn.example.com/x.png' })
    expect(result.success).toBe(false)
  })

  it('rejects a sortOrder above the max', () => {
    const result = createShopInputSchema.safeParse({ ...VALID_INPUT, sortOrder: 40000 })
    expect(result.success).toBe(false)
  })

  it('rejects an unknown field (strict)', () => {
    const result = createShopInputSchema.safeParse({ ...VALID_INPUT, unknown: 'x' })
    expect(result.success).toBe(false)
  })
})

describe('updateShopInputSchema', () => {
  it('omits slug', () => {
    const result = updateShopInputSchema.safeParse({ slug: 'other', name: 'Other' })
    expect(result.success).toBe(false)
  })

  it('accepts partial updates', () => {
    const result = updateShopInputSchema.safeParse({ name: 'New' })
    expect(result.success).toBe(true)
  })

  it('accepts an empty object', () => {
    const result = updateShopInputSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

describe('listAdminShops', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
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
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
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

  it('throws ApiRequestError on 409', async () => {
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
    ).rejects.toBeInstanceOf(ApiRequestError)
  })
})

describe('updateShop', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  it('returns the updated shop on success', async () => {
    mock.onPatch('/admin/shops/shop-1').reply(HttpStatus.OK, {
      shop: { ...MOCK_SHOP, name: 'Renamed' },
    })
    const shop = await updateShop('shop-1', { name: 'Renamed' })
    expect(shop.name).toBe('Renamed')
  })

  it('throws ApiRequestError on 404', async () => {
    mock.onPatch('/admin/shops/missing').reply(HttpStatus.NOT_FOUND, {
      code: 'NOT_FOUND',
      message: 'Not found',
    })
    await expect(updateShop('missing', { name: 'x' })).rejects.toBeInstanceOf(ApiRequestError)
  })

  it('throws ApiRequestError on 409', async () => {
    mock.onPatch('/admin/shops/shop-1').reply(HttpStatus.CONFLICT, {
      code: 'CONFLICT',
      message: 'Domain already exists',
    })
    await expect(updateShop('shop-1', { domain: 'x.com' })).rejects.toBeInstanceOf(ApiRequestError)
  })
})

describe('deleteShop', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  it('resolves on 204', async () => {
    mock.onDelete('/admin/shops/shop-1').reply(HttpStatus.NO_CONTENT)
    await expect(deleteShop('shop-1')).resolves.toBeUndefined()
  })

  it('throws ApiRequestError on 404', async () => {
    mock.onDelete('/admin/shops/missing').reply(HttpStatus.NOT_FOUND, {
      code: 'NOT_FOUND',
      message: 'Not found',
    })
    await expect(deleteShop('missing')).rejects.toBeInstanceOf(ApiRequestError)
  })
})
