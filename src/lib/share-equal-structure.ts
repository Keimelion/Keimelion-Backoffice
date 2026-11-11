function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype
}

function shareArray(previous: unknown[], next: unknown[]): unknown[] {
  const shared = next.map((value, index) => shareEqualStructure(previous[index], value))
  const isUnchanged =
    shared.length === previous.length && shared.every((value, index) => value === previous[index])
  return isUnchanged ? previous : shared
}

function shareRecord(
  previous: Record<string, unknown>,
  next: Record<string, unknown>,
): Record<string, unknown> {
  const nextKeys = Object.keys(next)
  const shared = Object.fromEntries(
    nextKeys.map((key) => [key, shareEqualStructure(previous[key], next[key])]),
  )
  const isUnchanged =
    nextKeys.length === Object.keys(previous).length &&
    nextKeys.every((key) => key in previous && shared[key] === previous[key])
  return isUnchanged ? previous : shared
}

export function shareEqualStructure(previous: unknown, next: unknown): unknown {
  if (previous instanceof Date && next instanceof Date) {
    return previous.getTime() === next.getTime() ? previous : next
  }
  if (Array.isArray(previous) && Array.isArray(next)) return shareArray(previous, next)
  if (isPlainRecord(previous) && isPlainRecord(next)) return shareRecord(previous, next)
  return next
}
