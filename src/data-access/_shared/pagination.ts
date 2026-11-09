import { z } from 'zod'
import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from '@keimelion/sdk/schemas'

export const basePaginationShape = {
  page: z.coerce.number().int().positive().catch(1),
  limit: z.coerce.number().int().positive().max(PAGINATION_MAX_LIMIT).catch(PAGINATION_DEFAULT_LIMIT),
} as const
