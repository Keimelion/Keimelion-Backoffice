interface PaginationParams {
  page?: number
  limit?: number
}

export function buildListSearchParams<T extends object>(
  params: Partial<T> & PaginationParams,
  filterKeys: readonly (keyof T & string)[],
): URLSearchParams {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.limit !== undefined) query.set('limit', String(params.limit))
  for (const key of filterKeys) {
    const value = (params as Partial<T>)[key]
    if (typeof value === 'string' && value.length > 0) {
      query.set(key, value)
    }
  }
  return query
}
