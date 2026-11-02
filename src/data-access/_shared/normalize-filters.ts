export function normalizeFilters<TFilters extends Record<string, unknown>>(
  filters: TFilters,
): TFilters {
  const entries = Object.entries(filters) as [keyof TFilters, TFilters[keyof TFilters]][]
  const normalized = entries
    .filter(([, value]) => value !== undefined && value !== '')
    .sort(([a], [b]) => String(a).localeCompare(String(b)))
  return Object.fromEntries(normalized) as TFilters
}
