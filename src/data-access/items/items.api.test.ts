import { describe, expect, it } from 'vitest'
import { buildListItemsParams } from './items.api'
import {
  adminItemListResponseSchema,
  adminItemSchema,
  createItemInputSchema,
  listItemsQuerySchema,
} from './items.schemas'

const MOCK_ITEM = {
  id: 'item-1',
  name: 'Espresso machine',
  description: 'A shiny espresso machine.',
  imageUrl: 'https://example.com/image.jpg',
  moderationStatus: 'approved',
  createdByUserId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
}

describe('adminItemSchema', () => {
  it('parses a full item object', () => {
    const result = adminItemSchema.safeParse(MOCK_ITEM)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.id).toBe('item-1')
    expect(result.data.moderationStatus).toBe('approved')
  })

  it('parses an item with null description, imageUrl and deletedAt set', () => {
    const result = adminItemSchema.safeParse({
      ...MOCK_ITEM,
      description: null,
      imageUrl: null,
      deletedAt: '2024-02-01T00:00:00.000Z',
    })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.description).toBeNull()
    expect(result.data.deletedAt).toBe('2024-02-01T00:00:00.000Z')
  })

  it('fails for an invalid moderationStatus value', () => {
    const result = adminItemSchema.safeParse({ ...MOCK_ITEM, moderationStatus: 'archived' })
    expect(result.success).toBe(false)
  })

  it('fails when required fields are missing', () => {
    const result = adminItemSchema.safeParse({ id: 'item-1' })
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
    if (!result.success) return
    expect(result.data.items).toHaveLength(1)
  })

  it('parses an empty items list', () => {
    const raw = { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
    const result = adminItemListResponseSchema.safeParse(raw)
    expect(result.success).toBe(true)
  })
})

describe('createItemInputSchema', () => {
  const VALID_INPUT = {
    name: 'Espresso machine',
    description: null,
    imageUrl: null,
    moderationStatus: 'approved',
  }

  it('parses a minimal valid input', () => {
    const result = createItemInputSchema.safeParse(VALID_INPUT)
    expect(result.success).toBe(true)
  })

  it('rejects an empty name', () => {
    const result = createItemInputSchema.safeParse({ ...VALID_INPUT, name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a name longer than 300 characters', () => {
    const result = createItemInputSchema.safeParse({ ...VALID_INPUT, name: 'a'.repeat(301) })
    expect(result.success).toBe(false)
  })

  it('rejects a description longer than 5000 characters', () => {
    const result = createItemInputSchema.safeParse({ ...VALID_INPUT, description: 'a'.repeat(5001) })
    expect(result.success).toBe(false)
  })

  it('rejects an http:// imageUrl', () => {
    const result = createItemInputSchema.safeParse({ ...VALID_INPUT, imageUrl: 'http://example.com/image.jpg' })
    expect(result.success).toBe(false)
  })

  it('rejects a javascript: imageUrl', () => {
    const result = createItemInputSchema.safeParse({ ...VALID_INPUT, imageUrl: 'javascript:alert(1)' })
    expect(result.success).toBe(false)
  })

  it('accepts an https:// imageUrl', () => {
    const result = createItemInputSchema.safeParse({ ...VALID_INPUT, imageUrl: 'https://example.com/image.jpg' })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid moderationStatus', () => {
    const result = createItemInputSchema.safeParse({ ...VALID_INPUT, moderationStatus: 'archived' })
    expect(result.success).toBe(false)
  })

  it('rejects unknown fields (strict)', () => {
    const result = createItemInputSchema.safeParse({ ...VALID_INPUT, extraField: 'nope' })
    expect(result.success).toBe(false)
  })
})

describe('buildListItemsParams', () => {
  it('builds a name[ilike] param for the name filter', () => {
    const params = buildListItemsParams({ name: 'espresso' })
    expect(params).toMatchObject({ 'name[ilike]': 'espresso' })
  })

  it('builds a moderationStatus[eq] param for the moderation status filter', () => {
    const params = buildListItemsParams({ moderationStatus: 'pending' })
    expect(params).toMatchObject({ 'moderationStatus[eq]': 'pending' })
  })

  it('builds a deletedAt[isNull]=false param when includeDeleted is true', () => {
    const params = buildListItemsParams({ includeDeleted: true })
    expect(params).toMatchObject({ 'deletedAt[isNull]': 'false' })
  })

  it('omits the deletedAt filter when includeDeleted is false or absent', () => {
    expect(buildListItemsParams({ includeDeleted: false })).not.toHaveProperty('deletedAt[isNull]')
    expect(buildListItemsParams({})).not.toHaveProperty('deletedAt[isNull]')
  })

  it('omits an empty name filter', () => {
    expect(buildListItemsParams({ name: '' })).not.toHaveProperty('name[ilike]')
  })

  it('carries page, limit and sort through untouched', () => {
    const params = buildListItemsParams({ page: 2, limit: 50, sort: 'name:asc' })
    expect(params).toMatchObject({ page: 2, limit: 50, sort: 'name:asc' })
  })
})

describe('listItemsQuerySchema', () => {
  it('defaults page, limit and sort when missing', () => {
    const result = listItemsQuerySchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.sort).toBe('createdAt:desc')
  })

  it('parses provided filters', () => {
    const result = listItemsQuerySchema.parse({
      name: 'espresso',
      moderationStatus: 'pending',
      includeDeleted: 'true',
      sort: 'name:asc',
    })
    expect(result.name).toBe('espresso')
    expect(result.moderationStatus).toBe('pending')
    expect(result.includeDeleted).toBe(true)
    expect(result.sort).toBe('name:asc')
  })
})
