import { z } from 'zod'
import { MAX_CATEGORY_DEPTH, MAX_CATEGORY_NAME_LENGTH } from '@keimelion/sdk/schemas'

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SLUG_MIN_LENGTH = 2
const SLUG_MAX_LENGTH = 60
const NAME_MIN_LENGTH = 1

const SLUG_INVALID_MESSAGE =
  'Slug must be lowercase letters and digits separated by hyphens (e.g. electronics).'
const NAME_REQUIRED_MESSAGE = 'Name is required.'
const NAME_TOO_LONG_MESSAGE = `Name must be ${String(MAX_CATEGORY_NAME_LENGTH)} characters or fewer.`
const NAME_AT_LEAST_ONE_LOCALE_MESSAGE = 'At least one translation must be provided.'

export const CATEGORY_MAX_ALLOWED_DEPTH = MAX_CATEGORY_DEPTH - 1

const slugSchema = z
  .string()
  .trim()
  .min(SLUG_MIN_LENGTH, { message: SLUG_INVALID_MESSAGE })
  .max(SLUG_MAX_LENGTH, { message: SLUG_INVALID_MESSAGE })
  .regex(SLUG_REGEX, { message: SLUG_INVALID_MESSAGE })

const nameValueSchema = z
  .string()
  .trim()
  .min(NAME_MIN_LENGTH, { message: NAME_REQUIRED_MESSAGE })
  .max(MAX_CATEGORY_NAME_LENGTH, { message: NAME_TOO_LONG_MESSAGE })

const parentIdSchema = z.uuid().nullable()

const createNameSchema = z.strictObject({ fr: nameValueSchema, en: nameValueSchema })

const updateNameSchema = z
  .strictObject({ fr: nameValueSchema.optional(), en: nameValueSchema.optional() })
  .refine((value) => value.fr !== undefined || value.en !== undefined, {
    message: NAME_AT_LEAST_ONE_LOCALE_MESSAGE,
  })

export const createCategoryInputSchema = z.strictObject({
  name: createNameSchema,
  slug: slugSchema,
  parentId: parentIdSchema,
})

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>

export const updateCategoryInputSchema = z.strictObject({
  name: updateNameSchema.optional(),
  slug: slugSchema.optional(),
  parentId: parentIdSchema.optional(),
})

export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>
