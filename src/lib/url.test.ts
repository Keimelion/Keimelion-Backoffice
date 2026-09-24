import { describe, expect, it } from 'vitest'
import { isHttpsUrl } from './url'

describe('isHttpsUrl', () => {
  it('accepts an https URL', () => {
    expect(isHttpsUrl('https://example.com/path')).toBe(true)
  })

  it('rejects an http URL', () => {
    expect(isHttpsUrl('http://example.com')).toBe(false)
  })

  it('rejects a javascript URL', () => {
    expect(isHttpsUrl('javascript:alert(1)')).toBe(false)
  })

  it('rejects a data URL', () => {
    expect(isHttpsUrl('data:text/html,<script>alert(1)</script>')).toBe(false)
  })

  it('rejects a file URL', () => {
    expect(isHttpsUrl('file:///etc/passwd')).toBe(false)
  })

  it('rejects null', () => {
    expect(isHttpsUrl(null)).toBe(false)
  })

  it('rejects undefined', () => {
    expect(isHttpsUrl(undefined)).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(isHttpsUrl('')).toBe(false)
  })

  it('is case-sensitive on the scheme', () => {
    expect(isHttpsUrl('HTTPS://example.com')).toBe(false)
  })
})
