import { describe, expect, it } from 'vitest'
import { collapseTagsIssuePaths } from './collapse-tags-issue-paths'

describe('collapseTagsIssuePaths', () => {
  it('leaves non-tag paths untouched', () => {
    const input = [
      { path: 'name', message: 'Name is required.', code: 'too_small' },
      { path: 'tags', message: 'Too many tags.', code: 'too_big' },
    ]
    expect(collapseTagsIssuePaths(input)).toEqual(input)
  })

  it('maps tags.0, tags.3 and similar indexed paths down to the tags field', () => {
    const input = [
      { path: 'tags.0', message: 'Tag name must be 50 characters or fewer.', code: 'too_big' },
      { path: 'tags.3', message: 'Tag name is required.', code: 'too_small' },
    ]
    expect(collapseTagsIssuePaths(input)).toEqual([
      { path: 'tags', message: 'Tag name must be 50 characters or fewer.', code: 'too_big' },
      { path: 'tags', message: 'Tag name is required.', code: 'too_small' },
    ])
  })

  it('does not collapse paths that merely contain the word tags elsewhere', () => {
    const input = [{ path: 'metaTags', message: 'Nope.', code: 'custom' }]
    expect(collapseTagsIssuePaths(input)).toEqual(input)
  })
})
