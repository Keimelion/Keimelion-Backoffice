import { z } from 'zod'

export const apiTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
})

export type ApiTag = z.infer<typeof apiTagSchema>

const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
})

export const adminTagListResponseSchema = z.object({
  items: z.array(apiTagSchema),
  pagination: paginationSchema,
})
