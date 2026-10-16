import type { ApiValidationIssue } from '@/data-access/_shared/api-error'

const TAG_PATH_PREFIX = 'tags.'

export function collapseTagsIssuePaths(
  issues: readonly ApiValidationIssue[],
): readonly ApiValidationIssue[] {
  return issues.map((issue) =>
    issue.path.startsWith(TAG_PATH_PREFIX) ? { ...issue, path: 'tags' } : issue,
  )
}
