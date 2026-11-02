export function buildQueryParams<T extends object>(input: Partial<T>): Record<string, unknown> {
  const params: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) continue
    if (typeof value === 'string' && value.length === 0) continue
    params[key] = value
  }
  return params
}
