import { describe, expect, it } from 'vitest'
import { slugify } from './slugify'

const SLUG_FORMAT = /^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/

describe('slugify', () => {
  it('lowercases ASCII input', () => {
    expect(slugify('Electronics')).toBe('electronics')
  })

  it('strips French diacritics', () => {
    expect(slugify('Électronique')).toBe('electronique')
    expect(slugify('Beauté & Santé')).toBe('beaute-sante')
  })

  it('strips a wide range of diacritics', () => {
    expect(slugify('Crème Brûlée Jalapeño')).toBe('creme-brulee-jalapeno')
  })

  it('replaces runs of special characters with a single dash', () => {
    expect(slugify('A/B — Cool!!')).toBe('a-b-cool')
  })

  it('collapses consecutive dashes', () => {
    expect(slugify('foo---bar')).toBe('foo-bar')
  })

  it('trims leading and trailing dashes', () => {
    expect(slugify('---foo-bar---')).toBe('foo-bar')
    expect(slugify('!!!hello!!!')).toBe('hello')
  })

  it('returns an empty string for empty or whitespace-only input', () => {
    expect(slugify('')).toBe('')
    expect(slugify('   ')).toBe('')
    expect(slugify('!!!')).toBe('')
  })

  it('preserves digits', () => {
    expect(slugify('Top 10 Gifts for 2026')).toBe('top-10-gifts-for-2026')
  })

  it('truncates at 60 characters and retrims trailing dashes', () => {
    const input = 'a'.repeat(60) + '-' + 'b'.repeat(10)
    const output = slugify(input)
    expect(output.length).toBeLessThanOrEqual(60)
    expect(output).toBe('a'.repeat(60))
  })

  it('removes a trailing dash left by truncation', () => {
    const input = 'a'.repeat(59) + '-' + 'b'.repeat(10)
    const output = slugify(input)
    expect(output).toBe('a'.repeat(59))
    expect(output.endsWith('-')).toBe(false)
  })

  it('normalises mixed emoji and punctuation input to a valid slug', () => {
    const output = slugify('🎁 Birthday — Party! 🎉')
    expect(output).toBe('birthday-party')
  })

  it('always produces output matching the slug format', () => {
    const inputs = [
      'Électronique',
      'Beauté & Santé',
      'A/B — Cool!!',
      'foo---bar',
      '---foo-bar---',
      'Top 10 Gifts for 2026',
      '🎁 Birthday — Party! 🎉',
      '!!!',
      '',
    ]
    for (const input of inputs) {
      expect(slugify(input)).toMatch(SLUG_FORMAT)
    }
  })
})
