import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createApiMock, type ApiMock } from '@/test/api-mock'
import { HttpStatus } from '@keimelion/sdk/enums'
import {
  createCategory,
  deleteCategory,
  fetchAdminCategory,
  listAdminCategories,
  updateCategory,
} from './categories.api'
import { ApiError } from '@keimelion/sdk/client'

const MOCK_PARENT_ID = '11111111-1111-4111-8111-111111111111'
const MOCK_OTHER_ID = '22222222-2222-4222-8222-222222222222'

const MOCK_CATEGORY = {
  id: MOCK_PARENT_ID,
  parentId: null,
  translations: { fr: 'Électronique', en: 'Electronics' },
  slug: 'electronics',
  depth: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('listAdminCategories', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
    vi.clearAllMocks()
  })

  it('returns every category in a flat array', async () => {
    mock.onGet('/admin/categories').reply(HttpStatus.OK, {
      items: [
        MOCK_CATEGORY,
        {
          ...MOCK_CATEGORY,
          id: MOCK_OTHER_ID,
          slug: 'phones',
          translations: { fr: 'Téléphones', en: 'Phones' },
        },
      ],
    })

    const items = await listAdminCategories()
    expect(items).toHaveLength(2)
    expect(items[0]?.slug).toBe('electronics')
    expect(items[1]?.slug).toBe('phones')
  })

  it('sends no query params', async () => {
    mock.onGet('/admin/categories').reply((config) => {
      expect(config.params).toEqual({})
      return [HttpStatus.OK, { items: [] }]
    })

    await listAdminCategories()
  })
})

describe('fetchAdminCategory', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('returns the parsed category on success', async () => {
    mock.onGet(`/admin/categories/${MOCK_CATEGORY.id}`).reply(HttpStatus.OK, {
      category: MOCK_CATEGORY,
    })
    const category = await fetchAdminCategory(MOCK_CATEGORY.id)
    expect(category.slug).toBe('electronics')
  })

  it('throws ApiError on 404', async () => {
    mock.onGet('/admin/categories/missing').reply(HttpStatus.NOT_FOUND, {
      code: 'CATEGORY_NOT_FOUND',
      message: 'Not found',
    })
    await expect(fetchAdminCategory('missing')).rejects.toBeInstanceOf(ApiError)
  })
})

describe('createCategory', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('posts the input body and returns the created category', async () => {
    mock.onPost('/admin/categories').reply((config) => {
      expect(JSON.parse(config.data as string)).toEqual({
        name: { fr: 'Téléphones', en: 'Phones' },
        slug: 'phones',
        parentId: null,
      })
      return [
        HttpStatus.CREATED,
        {
          category: {
            ...MOCK_CATEGORY,
            slug: 'phones',
            translations: { fr: 'Téléphones', en: 'Phones' },
          },
        },
      ]
    })
    const category = await createCategory({
      name: { fr: 'Téléphones', en: 'Phones' },
      slug: 'phones',
      parentId: null,
    })
    expect(category.slug).toBe('phones')
  })

  it('throws ApiError on 409 slug conflict', async () => {
    mock.onPost('/admin/categories').reply(HttpStatus.CONFLICT, {
      code: 'CONFLICT',
      message: 'Slug already in use',
    })
    await expect(
      createCategory({
        name: { fr: 'Électronique', en: 'Electronics' },
        slug: 'electronics',
        parentId: null,
      }),
    ).rejects.toBeInstanceOf(ApiError)
  })
})

describe('updateCategory', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('patches the given id and returns the updated category', async () => {
    mock.onPatch(`/admin/categories/${MOCK_CATEGORY.id}`).reply((config) => {
      expect(JSON.parse(config.data as string)).toEqual({ name: { en: 'Renamed' } })
      return [
        HttpStatus.OK,
        {
          category: {
            ...MOCK_CATEGORY,
            translations: { fr: 'Électronique', en: 'Renamed' },
          },
        },
      ]
    })
    const category = await updateCategory(MOCK_CATEGORY.id, { name: { en: 'Renamed' } })
    expect(category.translations.en).toBe('Renamed')
  })

  it('throws ApiError on 422 max depth exceeded', async () => {
    mock.onPatch(`/admin/categories/${MOCK_CATEGORY.id}`).reply(HttpStatus.UNPROCESSABLE_ENTITY, {
      code: 'CATEGORY_MAX_DEPTH_EXCEEDED',
      message: 'Max depth exceeded',
    })
    await expect(
      updateCategory(MOCK_CATEGORY.id, { parentId: MOCK_OTHER_ID }),
    ).rejects.toBeInstanceOf(ApiError)
  })
})

describe('deleteCategory', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
  })

  it('resolves on 204', async () => {
    mock.onDelete(`/admin/categories/${MOCK_CATEGORY.id}`).reply(HttpStatus.NO_CONTENT)
    await expect(deleteCategory(MOCK_CATEGORY.id)).resolves.toBeUndefined()
  })

  it('throws ApiError on 404', async () => {
    mock.onDelete('/admin/categories/missing').reply(HttpStatus.NOT_FOUND, {
      code: 'CATEGORY_NOT_FOUND',
      message: 'Not found',
    })
    await expect(deleteCategory('missing')).rejects.toBeInstanceOf(ApiError)
  })
})
