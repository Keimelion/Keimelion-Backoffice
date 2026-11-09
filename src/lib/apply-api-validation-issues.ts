import type { ValidationIssueParsed } from '@keimelion/sdk/schemas'

type SetFieldError = (path: string, error: { message: string }) => void

export function applyApiValidationIssues(
  issues: readonly ValidationIssueParsed[],
  setError: SetFieldError,
  allowedPaths: readonly string[],
): number {
  const allowedSet = new Set(allowedPaths)
  let appliedCount = 0
  for (const issue of issues) {
    if (!allowedSet.has(issue.path)) continue
    setError(issue.path, { message: issue.message })
    appliedCount += 1
  }
  return appliedCount
}
