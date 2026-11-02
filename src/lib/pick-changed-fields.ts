export function pickChangedFields<T extends object, K extends keyof T>(
  before: Partial<T>,
  after: T,
  keys: readonly K[],
): Partial<Pick<T, K>> {
  const patch: Partial<Pick<T, K>> = {}
  for (const key of keys) {
    if (before[key] !== after[key]) {
      patch[key] = after[key]
    }
  }
  return patch
}
