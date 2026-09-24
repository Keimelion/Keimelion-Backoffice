import { describe, expect, it } from 'vitest'
import {
  createItemSourceInputSchema,
  itemSourceListResponseSchema,
  itemSourceSchema,
} from './item-sources.schemas'

const MOCK_SOURCE = {
  id: 'source-1',
  itemId: 'item-1',
  shopId: 'a1b2c3d4-e5f6-4789-a012-3456789abcde',
  sourceUrl: 'https://shop.example.com/product',
  price: '19.99',
  currency: 'EUR',
  isPrimary: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('itemSourceSchema', () => {
  it('parses a full source object', () => {
    const result = itemSourceSchema.safeParse(MOCK_SOURCE)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.isPrimary).toBe(true)
  })

  it('parses a source with null shopId, sourceUrl and price', () => {
    const result = itemSourceSchema.safeParse({
      ...MOCK_SOURCE,
      shopId: null,
      sourceUrl: null,
      price: null,
    })
    expect(result.success).toBe(true)
  })

  it('fails when required fields are missing', () => {
    const result = itemSourceSchema.safeParse({ id: 'source-1' })
    expect(result.success).toBe(false)
  })
})

describe('itemSourceListResponseSchema', () => {
  it('parses a valid sources response', () => {
    const result = itemSourceListResponseSchema.safeParse({ sources: [MOCK_SOURCE] })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.sources).toHaveLength(1)
  })

  it('parses an empty sources list', () => {
    const result = itemSourceListResponseSchema.safeParse({ sources: [] })
    expect(result.success).toBe(true)
  })
})

describe('createItemSourceInputSchema', () => {
  const VALID_INPUT = {
    shopId: null,
    sourceUrl: 'https://shop.example.com/product',
    price: '19.99',
    currency: 'EUR',
    isPrimary: false,
  }

  it('parses a minimal valid input', () => {
    const result = createItemSourceInputSchema.safeParse(VALID_INPUT)
    expect(result.success).toBe(true)
  })

  it('rejects a missing currency (the form always supplies the EUR default)', () => {
    const result = createItemSourceInputSchema.safeParse({
      shopId: VALID_INPUT.shopId,
      sourceUrl: VALID_INPUT.sourceUrl,
      price: VALID_INPUT.price,
      isPrimary: VALID_INPUT.isPrimary,
    })
    expect(result.success).toBe(false)
  })

  it('rejects an http:// sourceUrl', () => {
    const result = createItemSourceInputSchema.safeParse({ ...VALID_INPUT, sourceUrl: 'http://shop.example.com' })
    expect(result.success).toBe(false)
  })

  it('rejects a javascript: sourceUrl', () => {
    const result = createItemSourceInputSchema.safeParse({ ...VALID_INPUT, sourceUrl: 'javascript:alert(1)' })
    expect(result.success).toBe(false)
  })

  it('rejects a negative price', () => {
    const result = createItemSourceInputSchema.safeParse({ ...VALID_INPUT, price: '-1' })
    expect(result.success).toBe(false)
  })

  it('rejects a price with three decimal digits', () => {
    const result = createItemSourceInputSchema.safeParse({ ...VALID_INPUT, price: '1.234' })
    expect(result.success).toBe(false)
  })

  it('accepts a price at the integer-digit boundary', () => {
    const result = createItemSourceInputSchema.safeParse({ ...VALID_INPUT, price: '12345678.99' })
    expect(result.success).toBe(true)
  })

  it('rejects a lowercase currency', () => {
    const result = createItemSourceInputSchema.safeParse({ ...VALID_INPUT, currency: 'eur' })
    expect(result.success).toBe(false)
  })

  it('rejects a non-uuid shopId', () => {
    const result = createItemSourceInputSchema.safeParse({ ...VALID_INPUT, shopId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('rejects unknown fields (strict)', () => {
    const result = createItemSourceInputSchema.safeParse({ ...VALID_INPUT, extraField: 'nope' })
    expect(result.success).toBe(false)
  })
})
