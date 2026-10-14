import { z } from 'zod'

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SLUG_MIN_LENGTH = 2
const SLUG_MAX_LENGTH = 60
const NAME_MIN_LENGTH = 1
const NAME_MAX_LENGTH = 120
const CATEGORY_MAX_DEPTH = 2

const SLUG_INVALID_MESSAGE =
  'Slug must be lowercase letters and digits separated by hyphens (e.g. electronics).'
const NAME_REQUIRED_MESSAGE = 'Name is required.'
const NAME_TOO_LONG_MESSAGE = 'Name must be 120 characters or fewer.'
const NAME_AT_LEAST_ONE_LOCALE_MESSAGE = 'At least one translation must be provided.'

export const CATEGORY_MAX_ALLOWED_DEPTH = CATEGORY_MAX_DEPTH

export const categoryTranslationsSchema = z.object({
  fr: z.string().optional(),
  en: z.string().optional(),
})

export type CategoryTranslations = z.infer<typeof categoryTranslationsSchema>

export const apiCategorySchema = z.object({
  id: z.string(),
  parentId: z.string().nullable(),
  slug: z.string(),
  depth: z.number().int().min(0).max(CATEGORY_MAX_DEPTH),
  translations: categoryTranslationsSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ApiCategory = z.infer<typeof apiCategorySchema>

export const adminCategoryListResponseSchema = z.object({
  items: z.array(apiCategorySchema),
})

export type AdminCategoryListResponse = z.infer<typeof adminCategoryListResponseSchema>

export const adminCategoryMutationResponseSchema = z.object({
  category: apiCategorySchema,
})

export type AdminCategoryMutationResponse = z.infer<typeof adminCategoryMutationResponseSchema>

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
  .max(NAME_MAX_LENGTH, { message: NAME_TOO_LONG_MESSAGE })

const parentIdSchema = z.uuid().nullable()

const createNameSchema = z
  .object({
    fr: nameValueSchema,
    en: nameValueSchema,
  })
  .strict()

const updateNameSchema = z
  .object({
    fr: nameValueSchema.optional(),
    en: nameValueSchema.optional(),
  })
  .strict()
  .refine((value) => value.fr !== undefined || value.en !== undefined, {
    message: NAME_AT_LEAST_ONE_LOCALE_MESSAGE,
  })

export const createCategoryInputSchema = z
  .object({
    name: createNameSchema,
    slug: slugSchema,
    parentId: parentIdSchema,
  })
  .strict()

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>

export const updateCategoryInputSchema = z
  .object({
    name: updateNameSchema.optional(),
    slug: slugSchema.optional(),
    parentId: parentIdSchema.optional(),
  })
  .strict()

export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>
