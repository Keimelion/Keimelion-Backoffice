import { describe, expect, it } from 'vitest'
import { formatAppVersion } from './format-app-version'

describe('formatAppVersion', () => {
  it('prefixes the version with v', () => {
    expect(formatAppVersion('0.2.0', null)).toBe('v0.2.0')
  })

  it('ignores an empty commit sha', () => {
    expect(formatAppVersion('0.2.0', '')).toBe('v0.2.0')
  })

  it('appends the commit sha as build metadata', () => {
    expect(formatAppVersion('0.2.0', 'a1b2c3d')).toBe('v0.2.0+a1b2c3d')
  })
})
