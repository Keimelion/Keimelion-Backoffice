import { z } from 'zod'
import { basePaginationShape } from '@/data-access/_shared/pagination'

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SLUG_MIN_LENGTH = 2
const SLUG_MAX_LENGTH = 60
const NAME_MIN_LENGTH = 1
const NAME_MAX_LENGTH = 120
const DOMAIN_MAX_LENGTH = 253
const LOGO_URL_MAX_LENGTH = 2048
const SORT_ORDER_MIN = 0
const SORT_ORDER_MAX = 32767

const SLUG_INVALID_MESSAGE = 'Slug must be lowercase letters and digits separated by hyphens (e.g. my-shop).'
const NAME_REQUIRED_MESSAGE = 'Name is required.'
const NAME_TOO_LONG_MESSAGE = 'Name must be 120 characters or fewer.'
const DOMAIN_TOO_LONG_MESSAGE = 'Domain must be 253 characters or fewer.'
const LOGO_URL_INVALID_MESSAGE = 'Logo URL must be a valid URL.'
const LOGO_URL_HTTPS_MESSAGE = 'Logo URL must use HTTPS.'
const LOGO_URL_TOO_LONG_MESSAGE = 'Logo URL must be 2048 characters or fewer.'

export const adminShopSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  domain: z.string().nullable(),
  logoUrl: z.string().nullable(),
  isAffiliated: z.boolean(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type AdminShop = z.infer<typeof adminShopSchema>

const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
})

export const adminShopListResponseSchema = z.object({
  items: z.array(adminShopSchema),
  pagination: paginationSchema,
})

export type AdminShopListResponse = z.infer<typeof adminShopListResponseSchema>

export const adminShopMutationResponseSchema = z.object({
  shop: adminShopSchema,
})

export type AdminShopMutationResponse = z.infer<typeof adminShopMutationResponseSchema>

const SORTABLE_FIELDS = ['name', 'slug', 'sortOrder', 'createdAt', 'updatedAt'] as const
const SORT_DIRECTIONS = ['asc', 'desc'] as const

export type AdminShopSortField = (typeof SORTABLE_FIELDS)[number]

const SORT_VALUES = SORTABLE_FIELDS.flatMap((field) =>
  SORT_DIRECTIONS.map((direction) => `${field}:${direction}` as const),
) as [`${AdminShopSortField}:${(typeof SORT_DIRECTIONS)[number]}`, ...`${AdminShopSortField}:${(typeof SORT_DIRECTIONS)[number]}`[]]

const booleanStringSchema = z
  .enum(['true', 'false'])
  .transform((value): boolean => value === 'true')

export const listShopsQuerySchema = z.object({
  ...basePaginationShape,
  search: z.string().trim().min(1).optional(),
  isActive: booleanStringSchema.optional(),
  isAffiliated: booleanStringSchema.optional(),
  sort: z.enum(SORT_VALUES).optional(),
})

export type ListShopsQuery = z.infer<typeof listShopsQuerySchema>

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

const domainSchema = z
  .string()
  .trim()
  .max(DOMAIN_MAX_LENGTH, { message: DOMAIN_TOO_LONG_MESSAGE })
  .nullable()

const logoUrlSchema = z
  .url({ message: LOGO_URL_INVALID_MESSAGE })
  .max(LOGO_URL_MAX_LENGTH, { message: LOGO_URL_TOO_LONG_MESSAGE })
  .refine((value) => value.startsWith('https://'), { message: LOGO_URL_HTTPS_MESSAGE })
  .nullable()

const sortOrderSchema = z.number().int().min(SORT_ORDER_MIN).max(SORT_ORDER_MAX)

export const createShopInputSchema = z
  .object({
    slug: slugSchema,
    name: nameSchema,
    domain: domainSchema,
    logoUrl: logoUrlSchema,
    isAffiliated: z.boolean(),
    sortOrder: sortOrderSchema,
    isActive: z.boolean(),
  })
  .strict()

export type CreateShopInput = z.infer<typeof createShopInputSchema>

export const updateShopInputSchema = createShopInputSchema.partial().omit({ slug: true })

export type UpdateShopInput = z.infer<typeof updateShopInputSchema>
