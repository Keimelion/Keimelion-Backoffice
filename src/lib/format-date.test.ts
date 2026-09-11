import { describe, expect, it } from 'vitest'
import { formatDate } from './format-date'

describe('formatDate', () => {
  it('formats a known ISO string as dd/MM/yyyy', () => {
    expect(formatDate('2024-03-15T00:00:00.000Z')).toBe('15/03/2024')
  })

  it('handles UTC midnight input without off-by-one day error', () => {
    expect(formatDate('2024-01-01T00:00:00.000Z')).toBe('01/01/2024')
  })
})
