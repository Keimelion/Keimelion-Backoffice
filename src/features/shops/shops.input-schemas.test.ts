import { describe, expect, it } from 'vitest'
import {
  createShopInputSchema,
  listShopsQuerySchema,
  updateShopInputSchema,
} from '@/features/shops/shops.input-schemas'

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
    const result = createShopInputSchema.safeParse({
      ...VALID_INPUT,
      logoUrl: 'http://cdn.example.com/x.png',
    })
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
