import { describe, expect, it, vi } from 'vitest'
import type { ApiValidationIssue } from '@/data-access/_shared/api-error'
import { applyApiValidationIssues } from './apply-api-validation-issues'

const ISSUE_NAME: ApiValidationIssue = {
  path: 'name',
  message: 'Name must be at least 1 character.',
  code: 'too_small',
}

const ISSUE_IMAGE_URL: ApiValidationIssue = {
  path: 'imageUrl',
  message: 'Image URL must use HTTPS.',
  code: 'custom',
}

const ISSUE_UNKNOWN: ApiValidationIssue = {
  path: 'nonExistentField',
  message: 'Unknown field.',
  code: 'custom',
}

const ALLOWED_PATHS = ['name', 'description', 'imageUrl', 'categories'] as const

describe('applyApiValidationIssues', () => {
  it('maps every issue whose path is in the allowed list', () => {
    const setError = vi.fn()

    const count = applyApiValidationIssues(
      [ISSUE_NAME, ISSUE_IMAGE_URL],
      setError,
      ALLOWED_PATHS,
    )

    expect(count).toBe(2)
    expect(setError).toHaveBeenCalledWith('name', { message: ISSUE_NAME.message })
    expect(setError).toHaveBeenCalledWith('imageUrl', { message: ISSUE_IMAGE_URL.message })
  })

  it('skips issues whose path is not in the allowed list', () => {
    const setError = vi.fn()

    const count = applyApiValidationIssues([ISSUE_UNKNOWN], setError, ALLOWED_PATHS)

    expect(count).toBe(0)
    expect(setError).not.toHaveBeenCalled()
  })

  it('returns the number of applied issues when some are filtered out', () => {
    const setError = vi.fn()

    const count = applyApiValidationIssues(
      [ISSUE_NAME, ISSUE_UNKNOWN],
      setError,
      ALLOWED_PATHS,
    )

    expect(count).toBe(1)
    expect(setError).toHaveBeenCalledTimes(1)
    expect(setError).toHaveBeenCalledWith('name', { message: ISSUE_NAME.message })
  })

  it('returns zero when the issues array is empty', () => {
    const setError = vi.fn()

    const count = applyApiValidationIssues([], setError, ALLOWED_PATHS)

    expect(count).toBe(0)
    expect(setError).not.toHaveBeenCalled()
  })
})
