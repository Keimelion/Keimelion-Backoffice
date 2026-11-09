import type { ValidationIssueParsed } from '@keimelion/sdk/schemas'

const TAG_PATH_PREFIX = 'tags.'

export function collapseTagsIssuePaths(
  issues: readonly ValidationIssueParsed[],
): readonly ValidationIssueParsed[] {
  return issues.map((issue) =>
    issue.path.startsWith(TAG_PATH_PREFIX) ? { ...issue, path: 'tags' } : issue,
  )
}
