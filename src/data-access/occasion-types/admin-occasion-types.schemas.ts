import { z } from 'zod'

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SLUG_MIN_LENGTH = 2
const SLUG_MAX_LENGTH = 60
const EMOJI_MAX_LENGTH = 10
const SORT_ORDER_MIN = 0
const SORT_ORDER_MAX = 32767
const LABEL_MIN_LENGTH = 1

export const adminOccasionTypeTranslationSchema = z.object({
  locale: z.string(),
  label: z.string(),
})

export type AdminOccasionTypeTranslation = z.infer<typeof adminOccasionTypeTranslationSchema>

export const adminOccasionTypeSchema = z.object({
  id: z.string(),
  slug: z.string(),
  emoji: z.string().nullable(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  translations: z.array(adminOccasionTypeTranslationSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type AdminOccasionType = z.infer<typeof adminOccasionTypeSchema>

const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
})

export const adminOccasionTypeListResponseSchema = z.object({
  items: z.array(adminOccasionTypeSchema),
  pagination: paginationSchema,
})

export type AdminOccasionTypeListResponse = z.infer<typeof adminOccasionTypeListResponseSchema>

const SLUG_INVALID_MESSAGE = 'Slug must be lowercase letters and digits separated by hyphens (e.g. my-occasion).'
const EN_LABEL_REQUIRED_MESSAGE = 'The English label is required.'

export const createOccasionTypeInputSchema = z.object({
  slug: z
    .string()
    .min(SLUG_MIN_LENGTH, { message: SLUG_INVALID_MESSAGE })
    .max(SLUG_MAX_LENGTH, { message: SLUG_INVALID_MESSAGE })
    .regex(SLUG_REGEX, { message: SLUG_INVALID_MESSAGE }),
  emoji: z.string().trim().max(EMOJI_MAX_LENGTH).nullable().optional(),
  sortOrder: z
    .number()
    .int()
    .min(SORT_ORDER_MIN)
    .max(SORT_ORDER_MAX),
  isActive: z.boolean(),
  labelEn: z.string().min(LABEL_MIN_LENGTH, { message: EN_LABEL_REQUIRED_MESSAGE }),
  labelFr: z.string().nullable().optional(),
})

export type CreateOccasionTypeInput = z.infer<typeof createOccasionTypeInputSchema>

export const updateOccasionTypeInputSchema = z.object({
  emoji: z.string().trim().max(EMOJI_MAX_LENGTH).nullable().optional(),
  sortOrder: z
    .number()
    .int()
    .min(SORT_ORDER_MIN)
    .max(SORT_ORDER_MAX),
  isActive: z.boolean(),
  labelEn: z.string().min(LABEL_MIN_LENGTH, { message: EN_LABEL_REQUIRED_MESSAGE }),
  labelFr: z.string().nullable().optional(),
})

export type UpdateOccasionTypeInput = z.infer<typeof updateOccasionTypeInputSchema>
