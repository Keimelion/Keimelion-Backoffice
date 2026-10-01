import { z } from 'zod'

export const DEFAULT_LIMIT = 20
export const MAX_LIMIT = 100

export const basePaginationShape = {
  page: z.coerce.number().int().positive().catch(1),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).catch(DEFAULT_LIMIT),
} as const
