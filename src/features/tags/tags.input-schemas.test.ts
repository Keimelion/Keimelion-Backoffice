import { describe, expect, it } from 'vitest'
import {
  createTagInputSchema,
  listTagsQuerySchema,
  updateTagInputSchema,
} from '@/features/tags/tags.input-schemas'

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
