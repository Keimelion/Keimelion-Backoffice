import { describe, expect, it } from 'vitest'
import { buildQueryParams } from '@/data-access/_shared/query-params'

describe('buildQueryParams', () => {
  it('keeps non-empty strings, numbers, and booleans', () => {
    const params = buildQueryParams({ email: 'a@b.com', page: 2, active: true })
    expect(params).toEqual({ email: 'a@b.com', page: 2, active: true })
  })

  it('drops undefined values', () => {
    const params = buildQueryParams({ email: 'a@b.com', role: undefined })
    expect(params).toEqual({ email: 'a@b.com' })
  })

  it('drops null values', () => {
    const params = buildQueryParams({ email: 'a@b.com', role: null })
    expect(params).toEqual({ email: 'a@b.com' })
  })

  it('drops empty strings (would produce trailing ?key= otherwise)', () => {
    const params = buildQueryParams({ email: '', page: 1 })
    expect(params).toEqual({ page: 1 })
  })

  it('keeps zero as a valid numeric value', () => {
    const params = buildQueryParams({ page: 0 })
    expect(params).toEqual({ page: 0 })
  })

  it('returns an empty object when every value is dropped', () => {
    const params = buildQueryParams({ email: '', role: undefined })
    expect(params).toEqual({})
  })
})
