export class ApiRequestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'ApiRequestError'
  }
}
