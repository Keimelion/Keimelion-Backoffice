import { describe, expect, it } from 'vitest'
import { shopListResponseSchema, shopSchema } from './shops.schemas'

const MOCK_SHOP = {
  id: 'shop-1',
  slug: 'amazon',
  name: 'Amazon',
  domain: 'amazon.com',
  logoUrl: 'https://example.com/logo.png',
  isAffiliated: true,
  sortOrder: 0,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('shopSchema', () => {
  it('parses a full shop object', () => {
    const result = shopSchema.safeParse(MOCK_SHOP)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.name).toBe('Amazon')
  })

  it('parses a shop with null domain and logoUrl', () => {
    const result = shopSchema.safeParse({ ...MOCK_SHOP, domain: null, logoUrl: null })
    expect(result.success).toBe(true)
  })

  it('fails when required fields are missing', () => {
    const result = shopSchema.safeParse({ id: 'shop-1' })
    expect(result.success).toBe(false)
  })
})

describe('shopListResponseSchema', () => {
  it('parses a valid list response', () => {
    const raw = { items: [MOCK_SHOP], pagination: { page: 1, limit: 100, total: 1, totalPages: 1 } }
    const result = shopListResponseSchema.safeParse(raw)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.items).toHaveLength(1)
  })

  it('parses an empty shops list', () => {
    const raw = { items: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 0 } }
    const result = shopListResponseSchema.safeParse(raw)
    expect(result.success).toBe(true)
  })
})
