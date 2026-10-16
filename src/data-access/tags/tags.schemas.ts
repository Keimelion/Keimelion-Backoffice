import { z } from 'zod'
import { basePaginationShape } from '@/data-access/_shared/pagination'

const TAG_NAME_MIN_LENGTH = 1
const TAG_NAME_MAX_LENGTH = 50

const NAME_REQUIRED_MESSAGE = 'Name is required.'
const NAME_TOO_LONG_MESSAGE = 'Name must be 50 characters or fewer.'

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

export type AdminTagListResponse = z.infer<typeof adminTagListResponseSchema>

export const adminTagMutationResponseSchema = z.object({
  tag: apiTagSchema,
})

export type AdminTagMutationResponse = z.infer<typeof adminTagMutationResponseSchema>

export const listTagsQuerySchema = z.object({
  ...basePaginationShape,
  search: z.string().trim().min(1).optional(),
})

export type ListTagsQuery = z.infer<typeof listTagsQuerySchema>

const nameSchema = z
  .string()
  .trim()
  .min(TAG_NAME_MIN_LENGTH, { message: NAME_REQUIRED_MESSAGE })
  .max(TAG_NAME_MAX_LENGTH, { message: NAME_TOO_LONG_MESSAGE })

export const createTagInputSchema = z
  .object({
    name: nameSchema,
  })
  .strict()

export type CreateTagInput = z.infer<typeof createTagInputSchema>

export const updateTagInputSchema = z
  .object({
    name: nameSchema.optional(),
  })
  .strict()

export type UpdateTagInput = z.infer<typeof updateTagInputSchema>
