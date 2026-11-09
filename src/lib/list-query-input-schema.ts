import { z } from 'zod'
import {
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_MAX_LIMIT,
  SORT_DIRECTIONS,
} from '@keimelion/sdk/schemas'

type SortValue<Field extends string> = `${Field}:${(typeof SORT_DIRECTIONS)[number]}`

const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const dateInputSchema = z.string().regex(DATE_INPUT_PATTERN)

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
