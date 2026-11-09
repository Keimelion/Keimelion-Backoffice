import { describe, expect, it } from 'vitest'
import { listFeedbackQuerySchema } from '@/features/feedback/feedback.input-schemas'

describe('listFeedbackQuerySchema', () => {
  it('applies defaults for page and limit', () => {
    const result = listFeedbackQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.page).toBe(1)
    expect(result.data.limit).toBe(20)
    expect(result.data.sort).toBe('createdAt:desc')
  })

  it('accepts a status filter', () => {
    const result = listFeedbackQuerySchema.safeParse({ status: 'reviewed' })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown status', () => {
    const result = listFeedbackQuerySchema.safeParse({ status: 'unknown' })
    expect(result.success).toBe(false)
  })

  it('accepts a date range in YYYY-MM-DD format', () => {
    const result = listFeedbackQuerySchema.safeParse({
      createdFrom: '2024-01-01',
      createdTo: '2024-12-31',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a malformed date range value', () => {
    const result = listFeedbackQuerySchema.safeParse({ createdFrom: '01/01/2024' })
    expect(result.success).toBe(false)
  })

  it('rejects a non-UUID userId', () => {
    const result = listFeedbackQuerySchema.safeParse({ userId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('accepts a valid sort', () => {
    const result = listFeedbackQuerySchema.safeParse({ sort: 'createdAt:asc' })
    expect(result.success).toBe(true)
  })

  it('falls back to the default sort when the value is invalid', () => {
    const result = listFeedbackQuerySchema.safeParse({ sort: 'title:asc' })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.sort).toBe('createdAt:desc')
  })
})
