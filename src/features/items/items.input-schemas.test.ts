import { describe, expect, it } from 'vitest'
import {
  findSupportedCurrency,
  createItemInputSchema,
  listItemsQuerySchema,
  updateItemInputSchema,
} from '@/features/items/items.input-schemas'

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
    image: null,
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

  it('accepts up to two valid UUID categories', () => {
    const result = createItemInputSchema.safeParse({
      ...VALID_INPUT,
      categories: ['11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222'],
    })
    expect(result.success).toBe(true)
  })

  it('rejects more than two categories', () => {
    const result = createItemInputSchema.safeParse({
      ...VALID_INPUT,
      categories: [
        '11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222',
        '33333333-3333-4333-8333-333333333333',
      ],
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-UUID category ids', () => {
    const result = createItemInputSchema.safeParse({
      ...VALID_INPUT,
      categories: ['not-a-uuid'],
    })
    expect(result.success).toBe(false)
  })

  it('accepts an empty categories array', () => {
    const result = createItemInputSchema.safeParse({ ...VALID_INPUT, categories: [] })
    expect(result.success).toBe(true)
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

  it('accepts a categories-only patch', () => {
    const result = updateItemInputSchema.safeParse({
      categories: ['11111111-1111-4111-8111-111111111111'],
    })
    expect(result.success).toBe(true)
  })

  it('rejects more than two categories', () => {
    const result = updateItemInputSchema.safeParse({
      categories: [
        '11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222',
        '33333333-3333-4333-8333-333333333333',
      ],
    })
    expect(result.success).toBe(false)
  })
})

describe('findSupportedCurrency', () => {
  it('returns a supported currency unchanged', () => {
    expect(findSupportedCurrency('USD')).toBe('USD')
  })

  it('returns undefined for a currency outside the supported list', () => {
    expect(findSupportedCurrency('SEK')).toBeUndefined()
  })
})
