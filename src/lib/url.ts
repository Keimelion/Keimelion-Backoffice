const HTTPS_PREFIX = 'https://'

export function isHttpsUrl(value: string | null | undefined): value is string {
  if (typeof value !== 'string') return false
  return value.startsWith(HTTPS_PREFIX)
}
