import { describe, expect, it } from 'vitest'
import {
  adminOccasionTypeSchema,
  adminOccasionTypeListResponseSchema,
} from './admin-occasion-types.schemas'

const MOCK_OCCASION_TYPE = {
  id: 'ot-1',
  slug: 'birthday',
  emoji: '🎂',
  sortOrder: 0,
  isActive: true,
  translations: [
    { locale: 'en', label: 'Birthday' },
    { locale: 'fr', label: 'Anniversaire' },
  ],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('adminOccasionTypeSchema', () => {
  it('parses a full occasion type object', () => {
    const result = adminOccasionTypeSchema.safeParse(MOCK_OCCASION_TYPE)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.id).toBe('ot-1')
    expect(result.data.slug).toBe('birthday')
    expect(result.data.isActive).toBe(true)
    expect(result.data.translations).toHaveLength(2)
  })

  it('parses an occasion type with null emoji', () => {
    const result = adminOccasionTypeSchema.safeParse({ ...MOCK_OCCASION_TYPE, emoji: null })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.emoji).toBeNull()
  })

  it('fails when required fields are missing', () => {
    const result = adminOccasionTypeSchema.safeParse({ id: 'ot-1' })
    expect(result.success).toBe(false)
  })
})

describe('adminOccasionTypeListResponseSchema', () => {
  it('parses a valid list response', () => {
    const raw = {
      items: [MOCK_OCCASION_TYPE],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    }
    const result = adminOccasionTypeListResponseSchema.safeParse(raw)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.items).toHaveLength(1)
    expect(result.data.pagination.total).toBe(1)
  })

  it('parses an empty items list', () => {
    const raw = {
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    }
    const result = adminOccasionTypeListResponseSchema.safeParse(raw)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.items).toHaveLength(0)
  })

  it('fails when pagination is missing', () => {
    const result = adminOccasionTypeListResponseSchema.safeParse({ items: [] })
    expect(result.success).toBe(false)
  })
})
