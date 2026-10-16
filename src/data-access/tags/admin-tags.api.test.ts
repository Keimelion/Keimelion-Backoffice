import { describe, expect, it, vi, beforeEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { axiosInstance } from '@/data-access/_shared/axios'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import {
  apiTagSchema,
  adminTagListResponseSchema,
  createTagInputSchema,
  listTagsQuerySchema,
  updateTagInputSchema,
} from './tags.schemas'
import {
  createTag,
  deleteTag,
  listAdminTags,
  updateTag,
} from './tags.api'

const MOCK_TAG = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'gaming',
  slug: 'gaming',
}

describe('apiTagSchema', () => {
  it('parses a valid tag object', () => {
    const result = apiTagSchema.safeParse(MOCK_TAG)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.slug).toBe('gaming')
  })

  it('strips unknown fields (non-strict object)', () => {
    const result = apiTagSchema.safeParse({ ...MOCK_TAG, createdAt: '2024-01-01T00:00:00.000Z' })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect('createdAt' in result.data).toBe(false)
  })

  it('fails when required fields are missing', () => {
    const result = apiTagSchema.safeParse({ id: '1' })
    expect(result.success).toBe(false)
  })
})

describe('adminTagListResponseSchema', () => {
  it('parses a valid list response', () => {
    const raw = {
      items: [MOCK_TAG],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    }
    const result = adminTagListResponseSchema.safeParse(raw)
    expect(result.success).toBe(true)
  })

  it('parses an empty list', () => {
    const raw = { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
    const result = adminTagListResponseSchema.safeParse(raw)
    expect(result.success).toBe(true)
  })

  it('fails when pagination is missing', () => {
    const result = adminTagListResponseSchema.safeParse({ items: [] })
    expect(result.success).toBe(false)
  })
})

describe('listTagsQuerySchema', () => {
  it('applies defaults for page and limit', () => {
    const result = listTagsQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.page).toBe(1)
    expect(result.data.limit).toBe(20)
  })

  it('coerces page and limit from strings', () => {
    const result = listTagsQuerySchema.safeParse({ page: '3', limit: '10' })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.page).toBe(3)
    expect(result.data.limit).toBe(10)
  })

  it('accepts a search string', () => {
    const result = listTagsQuerySchema.safeParse({ search: 'gam' })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.search).toBe('gam')
  })

  it('rejects an empty search string so the hook falls back to defaults', () => {
    const result = listTagsQuerySchema.safeParse({ search: '' })
    expect(result.success).toBe(false)
  })
})

describe('createTagInputSchema', () => {
  it('parses a valid input', () => {
    const result = createTagInputSchema.safeParse({ name: 'Gaming', slug: 'gaming' })
    expect(result.success).toBe(true)
  })

  it('trims surrounding whitespace on both fields', () => {
    const result = createTagInputSchema.safeParse({ name: '  Gaming  ', slug: '  gaming  ' })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.name).toBe('Gaming')
    expect(result.data.slug).toBe('gaming')
  })

  it('rejects an empty name', () => {
    const result = createTagInputSchema.safeParse({ name: '   ', slug: 'gaming' })
    expect(result.success).toBe(false)
  })

  it('rejects a name longer than 50 characters', () => {
    const result = createTagInputSchema.safeParse({ name: 'x'.repeat(51), slug: 'gaming' })
    expect(result.success).toBe(false)
  })

  it('rejects a slug that is not kebab-case', () => {
    const result = createTagInputSchema.safeParse({ name: 'Gaming', slug: 'Bad Slug!' })
    expect(result.success).toBe(false)
  })

  it('rejects a missing slug', () => {
    const result = createTagInputSchema.safeParse({ name: 'Gaming' })
    expect(result.success).toBe(false)
  })

  it('rejects unknown fields (strict)', () => {
    const result = createTagInputSchema.safeParse({
      name: 'Gaming',
      slug: 'gaming',
      extra: 'nope',
    })
    expect(result.success).toBe(false)
  })
})

describe('updateTagInputSchema', () => {
  it('accepts a name-only patch', () => {
    const result = updateTagInputSchema.safeParse({ name: 'Renamed' })
    expect(result.success).toBe(true)
  })

  it('accepts a slug-only patch', () => {
    const result = updateTagInputSchema.safeParse({ slug: 'renamed' })
    expect(result.success).toBe(true)
  })

  it('accepts both name and slug patch together', () => {
    const result = updateTagInputSchema.safeParse({ name: 'Renamed', slug: 'renamed' })
    expect(result.success).toBe(true)
  })

  it('accepts an empty object', () => {
    const result = updateTagInputSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('rejects a slug that is not kebab-case', () => {
    const result = updateTagInputSchema.safeParse({ slug: 'Bad Slug!' })
    expect(result.success).toBe(false)
  })

  it('rejects unknown fields (strict)', () => {
    const result = updateTagInputSchema.safeParse({ unknown: 'value' })
    expect(result.success).toBe(false)
  })
})

describe('listAdminTags', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
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
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  it('returns the created tag on success', async () => {
    mock.onPost('/admin/tags').reply((config) => {
      expect(JSON.parse(config.data as string)).toEqual({ name: 'Gaming', slug: 'gaming' })
      return [HttpStatus.CREATED, { tag: MOCK_TAG }]
    })
    const tag = await createTag({ name: 'Gaming', slug: 'gaming' })
    expect(tag.slug).toBe('gaming')
  })

  it('throws ApiRequestError on 409 conflict', async () => {
    mock.onPost('/admin/tags').reply(HttpStatus.CONFLICT, {
      code: 'CONFLICT',
      message: 'Resource already exists',
    })
    await expect(createTag({ name: 'Gaming', slug: 'gaming' })).rejects.toBeInstanceOf(
      ApiRequestError,
    )
  })
})

describe('updateTag', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  it('returns the updated tag on success', async () => {
    mock.onPatch(`/admin/tags/${MOCK_TAG.id}`).reply((config) => {
      expect(JSON.parse(config.data as string)).toEqual({ name: 'Renamed' })
      return [HttpStatus.OK, { tag: { ...MOCK_TAG, name: 'renamed', slug: 'renamed' } }]
    })
    const tag = await updateTag(MOCK_TAG.id, { name: 'Renamed' })
    expect(tag.slug).toBe('renamed')
  })

  it('throws ApiRequestError on 409 conflict', async () => {
    mock.onPatch(`/admin/tags/${MOCK_TAG.id}`).reply(HttpStatus.CONFLICT, {
      code: 'CONFLICT',
      message: 'Resource already exists',
    })
    await expect(updateTag(MOCK_TAG.id, { name: 'Dup' })).rejects.toBeInstanceOf(ApiRequestError)
  })
})

describe('deleteTag', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  it('resolves on 204', async () => {
    mock.onDelete(`/admin/tags/${MOCK_TAG.id}`).reply(HttpStatus.NO_CONTENT)
    await expect(deleteTag(MOCK_TAG.id)).resolves.toBeUndefined()
  })

  it('throws ApiRequestError on 404', async () => {
    mock.onDelete('/admin/tags/missing').reply(HttpStatus.NOT_FOUND, {
      code: 'TAG_NOT_FOUND',
      message: 'Not found',
    })
    await expect(deleteTag('missing')).rejects.toBeInstanceOf(ApiRequestError)
  })
})
