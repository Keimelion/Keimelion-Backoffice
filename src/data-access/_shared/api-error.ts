export interface ApiValidationIssue {
  readonly path: string
  readonly message: string
  readonly code: string
}

export class ApiRequestError extends Error {
  public readonly issues: readonly ApiValidationIssue[] | null

  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    issues: readonly ApiValidationIssue[] | null = null,
  ) {
    super(message)
    this.name = 'ApiRequestError'
    this.issues = issues
  }
}
