import { z } from 'zod'
import { basePaginationShape } from '@/data-access/_shared/pagination'

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

export const CATEGORY_DEPTH_VALUES = ['0', '1', '2'] as const
export type CategoryDepthFilter = (typeof CATEGORY_DEPTH_VALUES)[number]

export const CATEGORY_MAX_ALLOWED_DEPTH = CATEGORY_MAX_DEPTH

export const apiCategorySchema = z.object({
  id: z.string(),
  parentId: z.string().nullable(),
  name: z.string(),
  slug: z.string(),
  depth: z.number().int().min(0).max(CATEGORY_MAX_DEPTH),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ApiCategory = z.infer<typeof apiCategorySchema>

const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
})

export const adminCategoryListResponseSchema = z.object({
  items: z.array(apiCategorySchema),
  pagination: paginationSchema,
})

export type AdminCategoryListResponse = z.infer<typeof adminCategoryListResponseSchema>

export const adminCategoryMutationResponseSchema = z.object({
  category: apiCategorySchema,
})

export type AdminCategoryMutationResponse = z.infer<typeof adminCategoryMutationResponseSchema>

const SORTABLE_FIELDS = ['name', 'slug', 'createdAt', 'updatedAt'] as const
const SORT_DIRECTIONS = ['asc', 'desc'] as const

export type AdminCategorySortField = (typeof SORTABLE_FIELDS)[number]

const SORT_VALUES = SORTABLE_FIELDS.flatMap((field) =>
  SORT_DIRECTIONS.map((direction) => `${field}:${direction}` as const),
) as [
  `${AdminCategorySortField}:${(typeof SORT_DIRECTIONS)[number]}`,
  ...`${AdminCategorySortField}:${(typeof SORT_DIRECTIONS)[number]}`[],
]

const depthFilterSchema = z
  .enum(CATEGORY_DEPTH_VALUES)
  .transform((value): number => Number(value))

export const listCategoriesQuerySchema = z.object({
  ...basePaginationShape,
  search: z.string().trim().min(1).optional(),
  depth: depthFilterSchema.optional(),
  parentId: z.uuid().optional(),
  sort: z.enum(SORT_VALUES).optional(),
})

export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>

const slugSchema = z
  .string()
  .trim()
  .min(SLUG_MIN_LENGTH, { message: SLUG_INVALID_MESSAGE })
  .max(SLUG_MAX_LENGTH, { message: SLUG_INVALID_MESSAGE })
  .regex(SLUG_REGEX, { message: SLUG_INVALID_MESSAGE })

const nameSchema = z
  .string()
  .trim()
  .min(NAME_MIN_LENGTH, { message: NAME_REQUIRED_MESSAGE })
  .max(NAME_MAX_LENGTH, { message: NAME_TOO_LONG_MESSAGE })

const parentIdSchema = z.uuid().nullable()

export const createCategoryInputSchema = z
  .object({
    name: nameSchema,
    slug: slugSchema,
    parentId: parentIdSchema,
  })
  .strict()

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>

export const updateCategoryInputSchema = z
  .object({
    name: nameSchema.optional(),
    slug: slugSchema.optional(),
    parentId: parentIdSchema.optional(),
  })
  .strict()

export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>
