import { z } from 'zod'
import {
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_MAX_LIMIT,
  SORT_DIRECTIONS,
} from '@keimelion/sdk/schemas'

type SortValue<Field extends string> = `${Field}:${(typeof SORT_DIRECTIONS)[number]}`

export const basePaginationShape = {
  page: z.coerce.number().int().positive().catch(1),
  limit: z.coerce.number().int().positive().max(PAGINATION_MAX_LIMIT).catch(PAGINATION_DEFAULT_LIMIT),
} as const

export function buildSortValues<Field extends string>(
  fields: readonly Field[],
): [SortValue<Field>, ...SortValue<Field>[]] {
  return fields.flatMap((field) =>
    SORT_DIRECTIONS.map((direction) => `${field}:${direction}` as const),
  ) as [SortValue<Field>, ...SortValue<Field>[]]
}
