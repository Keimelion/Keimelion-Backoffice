import { describe, expect, it } from 'vitest'
import { haveSameUnorderedValues } from './have-same-unordered-values'

describe('haveSameUnorderedValues', () => {
  it('returns true for identical arrays', () => {
    expect(haveSameUnorderedValues(['a', 'b'], ['a', 'b'])).toBe(true)
  })

  it('returns true when the order differs but the values match', () => {
    expect(haveSameUnorderedValues(['a', 'b', 'c'], ['c', 'b', 'a'])).toBe(true)
  })

  it('returns false when lengths differ', () => {
    expect(haveSameUnorderedValues(['a'], ['a', 'b'])).toBe(false)
  })

  it('returns false when any value differs', () => {
    expect(haveSameUnorderedValues(['a', 'b'], ['a', 'c'])).toBe(false)
  })

  it('returns true for two empty arrays', () => {
    expect(haveSameUnorderedValues([], [])).toBe(true)
  })
})
