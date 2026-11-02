import { describe, expect, it } from 'vitest'
import { isSafeImageUrl } from './is-safe-image-url'

describe('isSafeImageUrl', () => {
  it('accepts http URLs', () => {
    expect(isSafeImageUrl('http://cdn.example.com/a.webp')).toBe(true)
  })

  it('accepts https URLs', () => {
    expect(isSafeImageUrl('https://cdn.example.com/a.webp')).toBe(true)
  })

  it('rejects null', () => {
    expect(isSafeImageUrl(null)).toBe(false)
  })

  it('rejects undefined', () => {
    expect(isSafeImageUrl(undefined)).toBe(false)
  })

  it('rejects malformed URLs', () => {
    expect(isSafeImageUrl('not a url')).toBe(false)
  })

  it('rejects javascript: protocol', () => {
    expect(isSafeImageUrl('javascript:alert(1)')).toBe(false)
  })

  it('rejects data: protocol', () => {
    expect(isSafeImageUrl('data:image/png;base64,AAA')).toBe(false)
  })

  it('rejects file: protocol', () => {
    expect(isSafeImageUrl('file:///etc/passwd')).toBe(false)
  })
})
