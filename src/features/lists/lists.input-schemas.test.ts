import { describe, expect, it } from 'vitest'
import { listListsQuerySchema, updateListInputSchema } from '@/features/lists/lists.input-schemas'

describe('listListsQuerySchema', () => {
  it('applies defaults for page and limit', () => {
    const result = listListsQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.page).toBe(1)
    expect(result.data.limit).toBe(20)
  })

  it('accepts a valid sort', () => {
    const result = listListsQuerySchema.safeParse({ sort: 'createdAt:desc' })
    expect(result.success).toBe(true)
  })

  it('rejects a sort on a non-sortable field', () => {
    const result = listListsQuerySchema.safeParse({ sort: 'slug:asc' })
    expect(result.success).toBe(false)
  })

  it('accepts a listStatus filter', () => {
    const result = listListsQuerySchema.safeParse({ listStatus: 'active' })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown listStatus', () => {
    const result = listListsQuerySchema.safeParse({ listStatus: 'unknown' })
    expect(result.success).toBe(false)
  })

  it('rejects a non-UUID ownerUserId', () => {
    const result = listListsQuerySchema.safeParse({ ownerUserId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })
})

describe('updateListInputSchema', () => {
  it('accepts a partial update', () => {
    const result = updateListInputSchema.safeParse({ title: 'Renamed' })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown field (strict)', () => {
    const result = updateListInputSchema.safeParse({ title: 'x', unknown: 'y' })
    expect(result.success).toBe(false)
  })

  it('rejects a title that is too long', () => {
    const result = updateListInputSchema.safeParse({ title: 'x'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('accepts a null occasionTypeId', () => {
    const result = updateListInputSchema.safeParse({ occasionTypeId: null })
    expect(result.success).toBe(true)
  })

  it('accepts a tags array', () => {
    const result = updateListInputSchema.safeParse({ tags: ['family', 'birthday'] })
    expect(result.success).toBe(true)
  })

  it('rejects more than the max number of tags', () => {
    const result = updateListInputSchema.safeParse({
      tags: Array.from({ length: 21 }, (_, index) => `tag-${String(index)}`),
    })
    expect(result.success).toBe(false)
  })
})
