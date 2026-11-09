import { describe, expect, it } from 'vitest'
import {
  createCategoryInputSchema,
  updateCategoryInputSchema,
} from '@/features/categories/categories.input-schemas'

const MOCK_OTHER_ID = '22222222-2222-4222-8222-222222222222'

describe('createCategoryInputSchema', () => {
  const VALID_INPUT = {
    name: { fr: 'Électronique', en: 'Electronics' },
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

  it('rejects when a locale is missing', () => {
    const result = createCategoryInputSchema.safeParse({
      ...VALID_INPUT,
      name: { en: 'Electronics' },
    })
    expect(result.success).toBe(false)
  })

  it('rejects when a locale value is blank', () => {
    const result = createCategoryInputSchema.safeParse({
      ...VALID_INPUT,
      name: { fr: '   ', en: 'Electronics' },
    })
    expect(result.success).toBe(false)
  })

  it('rejects an unknown field (strict)', () => {
    const result = createCategoryInputSchema.safeParse({ ...VALID_INPUT, unknown: 'x' })
    expect(result.success).toBe(false)
  })
})

describe('updateCategoryInputSchema', () => {
  it('accepts a single-locale name patch', () => {
    const result = updateCategoryInputSchema.safeParse({ name: { en: 'Renamed' } })
    expect(result.success).toBe(true)
  })

  it('rejects a name patch with no locales', () => {
    const result = updateCategoryInputSchema.safeParse({ name: {} })
    expect(result.success).toBe(false)
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
