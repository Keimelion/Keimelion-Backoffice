import { describe, expect, it } from 'vitest'
import { buildListSearchParams } from './list-query'

interface TestQuery {
  page: number
  limit: number
  email?: string
  role?: string
}

const FILTER_KEYS = ['email', 'role'] as const

describe('buildListSearchParams', () => {
  it('sets page and limit when provided', () => {
    const params = buildListSearchParams<TestQuery>({ page: 2, limit: 20 }, FILTER_KEYS)
    expect(params.get('page')).toBe('2')
    expect(params.get('limit')).toBe('20')
  })

  it('omits page and limit when undefined', () => {
    const params = buildListSearchParams<TestQuery>({}, FILTER_KEYS)
    expect(params.has('page')).toBe(false)
    expect(params.has('limit')).toBe(false)
  })

  it('sets string filter keys when truthy', () => {
    const params = buildListSearchParams<TestQuery>(
      { email: 'foo@bar.com', role: 'admin' },
      FILTER_KEYS,
    )
    expect(params.get('email')).toBe('foo@bar.com')
    expect(params.get('role')).toBe('admin')
  })

  it('skips empty string values', () => {
    const params = buildListSearchParams<TestQuery>({ email: '' }, FILTER_KEYS)
    expect(params.has('email')).toBe(false)
  })

  it('does not set keys outside the filterKeys config', () => {
    const params = buildListSearchParams<TestQuery>({ role: 'admin' }, ['email'] as const)
    expect(params.has('role')).toBe(false)
  })

  it('preserves ordering: page, limit, then filter keys', () => {
    const params = buildListSearchParams<TestQuery>(
      { page: 1, limit: 20, email: 'x' },
      FILTER_KEYS,
    )
    expect(params.toString()).toBe('page=1&limit=20&email=x')
  })
})
