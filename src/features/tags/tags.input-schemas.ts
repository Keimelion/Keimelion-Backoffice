import { z } from 'zod'
import { MAX_TAG_NAME_LENGTH, MAX_TAG_SLUG_LENGTH } from '@keimelion/sdk/schemas'
import { basePaginationShape } from '@/data-access/_shared/pagination'

const TAG_NAME_MIN_LENGTH = 1
const TAG_SLUG_MIN_LENGTH = 1
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const NAME_REQUIRED_MESSAGE = 'Name is required.'
const NAME_TOO_LONG_MESSAGE = `Name must be ${String(MAX_TAG_NAME_LENGTH)} characters or fewer.`
const SLUG_INVALID_MESSAGE =
  'Slug must be lowercase letters and digits separated by hyphens (e.g. gaming).'

export const listTagsQuerySchema = z.object({
  ...basePaginationShape,
  search: z.string().trim().min(1).optional(),
})

export type ListTagsQuery = z.infer<typeof listTagsQuerySchema>

const nameSchema = z
  .string()
  .trim()
  .min(TAG_NAME_MIN_LENGTH, { message: NAME_REQUIRED_MESSAGE })
  .max(MAX_TAG_NAME_LENGTH, { message: NAME_TOO_LONG_MESSAGE })

const slugSchema = z
  .string()
  .trim()
  .min(TAG_SLUG_MIN_LENGTH, { message: SLUG_INVALID_MESSAGE })
  .max(MAX_TAG_SLUG_LENGTH, { message: SLUG_INVALID_MESSAGE })
  .regex(SLUG_REGEX, { message: SLUG_INVALID_MESSAGE })

export const createTagInputSchema = z.strictObject({ name: nameSchema, slug: slugSchema })

export type CreateTagInput = z.infer<typeof createTagInputSchema>

export const updateTagInputSchema = z.strictObject({
  name: nameSchema.optional(),
  slug: slugSchema.optional(),
})

export type UpdateTagInput = z.infer<typeof updateTagInputSchema>
