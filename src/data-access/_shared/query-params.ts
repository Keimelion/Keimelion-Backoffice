const DAY_START_SUFFIX = 'T00:00:00.000Z'
const DAY_END_SUFFIX = 'T23:59:59.999Z'

export function emptyToUndefined(value: string | undefined): string | undefined {
  return value === undefined || value.length === 0 ? undefined : value
}

export function toDayStartIso(day: string | undefined): string | undefined {
  return day === undefined ? undefined : `${day}${DAY_START_SUFFIX}`
}

export function toDayEndIso(day: string | undefined): string | undefined {
  return day === undefined ? undefined : `${day}${DAY_END_SUFFIX}`
}
