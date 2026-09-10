import { PAGE_PARAM } from '@/lib/url-params'

const LIMIT_PARAM = 'limit'

interface PaginationParams {
  page?: number
  limit?: number
}

export function buildListSearchParams<T extends object>(
  params: Partial<T> & PaginationParams,
  filterKeys: readonly (keyof T & string)[],
): URLSearchParams {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.set(PAGE_PARAM, String(params.page))
  if (params.limit !== undefined) query.set(LIMIT_PARAM, String(params.limit))
  for (const key of filterKeys) {
    const value = (params as Partial<T>)[key]
    if (typeof value === 'string' && value.length > 0) {
      query.set(key, value)
    }
  }
  return query
}
