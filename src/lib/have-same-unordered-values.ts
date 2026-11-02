export function haveSameUnorderedValues(
  before: readonly string[],
  after: readonly string[],
): boolean {
  if (before.length !== after.length) return false
  const sortedBefore = [...before].sort()
  const sortedAfter = [...after].sort()
  return sortedBefore.every((value, index) => value === sortedAfter[index])
}
