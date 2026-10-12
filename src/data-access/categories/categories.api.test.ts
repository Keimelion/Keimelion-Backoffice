import { describe, expect, it, vi, beforeEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { axiosInstance } from '@/data-access/_shared/axios'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import {
  apiCategorySchema,
  adminCategoryListResponseSchema,
  createCategoryInputSchema,
  listCategoriesQuerySchema,
  updateCategoryInputSchema,
} from './categories.schemas'
import {
  createCategory,
  deleteCategory,
  fetchAdminCategory,
  listAdminCategories,
  updateCategory,
} from './categories.api'

const MOCK_PARENT_ID = '11111111-1111-4111-8111-111111111111'
const MOCK_OTHER_ID = '22222222-2222-4222-8222-222222222222'
const MOCK_FILTER_PARENT_ID = '33333333-3333-4333-8333-333333333333'

const MOCK_CATEGORY = {
  id: MOCK_PARENT_ID,
  parentId: null,
  name: 'Electronics',
  slug: 'electronics',
  depth: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('apiCategorySchema', () => {
  it('parses a root category', () => {
    const result = apiCategorySchema.safeParse(MOCK_CATEGORY)
    expect(result.success).toBe(true)
  })

  it('parses a nested category', () => {
    const result = apiCategorySchema.safeParse({
      ...MOCK_CATEGORY,
      parentId: MOCK_OTHER_ID,
      depth: 1,
    })
    expect(result.success).toBe(true)
  })

  it('rejects a depth above 2', () => {
    const result = apiCategorySchema.safeParse({ ...MOCK_CATEGORY, depth: 3 })
    expect(result.success).toBe(false)
  })
})

describe('adminCategoryListResponseSchema', () => {
  it('parses a valid list response', () => {
    const raw = {
      items: [MOCK_CATEGORY],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    }
    const result = adminCategoryListResponseSchema.safeParse(raw)
    expect(result.success).toBe(true)
  })

  it('parses an empty list', () => {
    const raw = { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
    const result = adminCategoryListResponseSchema.safeParse(raw)
    expect(result.success).toBe(true)
  })
})

describe('listCategoriesQuerySchema', () => {
  it('applies defaults for page and limit', () => {
    const result = listCategoriesQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.page).toBe(1)
    expect(result.data.limit).toBe(20)
  })

  it('coerces depth filter to a number', () => {
    const result = listCategoriesQuerySchema.safeParse({ depth: '1' })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.depth).toBe(1)
  })

  it('rejects a depth outside the 0..2 range', () => {
    const result = listCategoriesQuerySchema.safeParse({ depth: '3' })
    expect(result.success).toBe(false)
  })

  it('accepts a valid sort value', () => {
    const result = listCategoriesQuerySchema.safeParse({ sort: 'name:asc' })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.sort).toBe('name:asc')
  })

  it('rejects sort with an unknown field', () => {
    const result = listCategoriesQuerySchema.safeParse({ sort: 'depth:asc' })
    expect(result.success).toBe(false)
  })
})

describe('createCategoryInputSchema', () => {
  const VALID_INPUT = {
    name: 'Electronics',
    slug: 'electronics',
    parentId: null,
  }

  it('parses a valid input', () => {
    const result = createCategoryInputSchema.safeParse(VALID_INPUT)
    expect(result.success).toBe(true)
  })

  it('accepts a UUID parentId', () => {
    const result = createCategoryInputSchema.safeParse({
      ...VALID_INPUT,
      parentId: MOCK_OTHER_ID,
    })
    expect(result.success).toBe(true)
  })

  it('rejects a slug with uppercase letters', () => {
    const result = createCategoryInputSchema.safeParse({ ...VALID_INPUT, slug: 'Electronics' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty name', () => {
    const result = createCategoryInputSchema.safeParse({ ...VALID_INPUT, name: '   ' })
    expect(result.success).toBe(false)
  })

  it('rejects an unknown field (strict)', () => {
    const result = createCategoryInputSchema.safeParse({ ...VALID_INPUT, unknown: 'x' })
    expect(result.success).toBe(false)
  })
})

describe('updateCategoryInputSchema', () => {
  it('accepts partial updates', () => {
    const result = updateCategoryInputSchema.safeParse({ name: 'Renamed' })
    expect(result.success).toBe(true)
  })

  it('accepts an empty object', () => {
    const result = updateCategoryInputSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts a null parentId (promote to root)', () => {
    const result = updateCategoryInputSchema.safeParse({ parentId: null })
    expect(result.success).toBe(true)
  })
})

describe('listAdminCategories', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
    vi.clearAllMocks()
  })

  it('sends pagination, filters and sort in the request', async () => {
    mock.onGet('/admin/categories').reply((config) => {
      expect(config.params).toEqual({
        page: '2',
        limit: '10',
        'name[ilike]': 'elec',
        'depth[eq]': '1',
        'parentId[eq]': MOCK_FILTER_PARENT_ID,
        sort: 'name:asc',
      })
      return [
        HttpStatus.OK,
        {
          items: [MOCK_CATEGORY],
          pagination: { page: 2, limit: 10, total: 1, totalPages: 1 },
        },
      ]
    })

    const response = await listAdminCategories({
      page: 2,
      limit: 10,
      search: 'elec',
      depth: 1,
      parentId: MOCK_FILTER_PARENT_ID,
      sort: 'name:asc',
    })

    expect(response.items).toHaveLength(1)
  })

  it('omits filters when not set', async () => {
    mock.onGet('/admin/categories').reply((config) => {
      expect(config.params).toEqual({ page: '1', limit: '20' })
      return [
        HttpStatus.OK,
        {
          items: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
      ]
    })

    await listAdminCategories({ page: 1, limit: 20 })
  })
})

describe('fetchAdminCategory', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  it('returns the parsed category on success', async () => {
    mock.onGet(`/admin/categories/${MOCK_CATEGORY.id}`).reply(HttpStatus.OK, {
      category: MOCK_CATEGORY,
    })
    const category = await fetchAdminCategory(MOCK_CATEGORY.id)
    expect(category.slug).toBe('electronics')
  })

  it('throws ApiRequestError on 404', async () => {
    mock.onGet('/admin/categories/missing').reply(HttpStatus.NOT_FOUND, {
      code: 'CATEGORY_NOT_FOUND',
      message: 'Not found',
    })
    await expect(fetchAdminCategory('missing')).rejects.toBeInstanceOf(ApiRequestError)
  })
})

describe('createCategory', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  it('posts the input body and returns the created category', async () => {
    mock.onPost('/admin/categories').reply((config) => {
      expect(JSON.parse(config.data as string)).toEqual({
        name: 'Phones',
        slug: 'phones',
        parentId: null,
      })
      return [HttpStatus.CREATED, { category: { ...MOCK_CATEGORY, name: 'Phones', slug: 'phones' } }]
    })
    const category = await createCategory({ name: 'Phones', slug: 'phones', parentId: null })
    expect(category.slug).toBe('phones')
  })

  it('throws ApiRequestError on 409 slug conflict', async () => {
    mock.onPost('/admin/categories').reply(HttpStatus.CONFLICT, {
      code: 'CONFLICT',
      message: 'Slug already in use',
    })
    await expect(
      createCategory({ name: 'Electronics', slug: 'electronics', parentId: null }),
    ).rejects.toBeInstanceOf(ApiRequestError)
  })
})

describe('updateCategory', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  it('patches the given id and returns the updated category', async () => {
    mock.onPatch(`/admin/categories/${MOCK_CATEGORY.id}`).reply((config) => {
      expect(JSON.parse(config.data as string)).toEqual({ name: 'Renamed' })
      return [HttpStatus.OK, { category: { ...MOCK_CATEGORY, name: 'Renamed' } }]
    })
    const category = await updateCategory(MOCK_CATEGORY.id, { name: 'Renamed' })
    expect(category.name).toBe('Renamed')
  })

  it('throws ApiRequestError on 422 max depth exceeded', async () => {
    mock.onPatch(`/admin/categories/${MOCK_CATEGORY.id}`).reply(HttpStatus.UNPROCESSABLE_ENTITY, {
      code: 'CATEGORY_MAX_DEPTH_EXCEEDED',
      message: 'Max depth exceeded',
    })
    await expect(
      updateCategory(MOCK_CATEGORY.id, { parentId: MOCK_OTHER_ID }),
    ).rejects.toBeInstanceOf(ApiRequestError)
  })
})

describe('deleteCategory', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  it('resolves on 204', async () => {
    mock.onDelete(`/admin/categories/${MOCK_CATEGORY.id}`).reply(HttpStatus.NO_CONTENT)
    await expect(deleteCategory(MOCK_CATEGORY.id)).resolves.toBeUndefined()
  })

  it('throws ApiRequestError on 404', async () => {
    mock.onDelete('/admin/categories/missing').reply(HttpStatus.NOT_FOUND, {
      code: 'CATEGORY_NOT_FOUND',
      message: 'Not found',
    })
    await expect(deleteCategory('missing')).rejects.toBeInstanceOf(ApiRequestError)
  })
})
