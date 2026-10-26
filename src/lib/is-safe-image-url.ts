const ALLOWED_PROTOCOLS: readonly string[] = ['http:', 'https:']

export function isSafeImageUrl(value: string | null | undefined): value is string {
  if (typeof value !== 'string') return false
  try {
    const parsed = new URL(value)
    return ALLOWED_PROTOCOLS.includes(parsed.protocol)
  } catch {
    return false
  }
}
