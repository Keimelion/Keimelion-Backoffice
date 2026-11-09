import { z } from 'zod'
import { ADMIN_SHOPS_SORT_FIELDS, SORT_DIRECTIONS } from '@keimelion/sdk/schemas'
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

const SLUG_INVALID_MESSAGE =
  'Slug must be lowercase letters and digits separated by hyphens (e.g. my-shop).'
const NAME_REQUIRED_MESSAGE = 'Name is required.'
const NAME_TOO_LONG_MESSAGE = 'Name must be 120 characters or fewer.'
const DOMAIN_TOO_LONG_MESSAGE = 'Domain must be 253 characters or fewer.'
const LOGO_URL_INVALID_MESSAGE = 'Logo URL must be a valid URL.'
const LOGO_URL_HTTPS_MESSAGE = 'Logo URL must use HTTPS.'
const LOGO_URL_TOO_LONG_MESSAGE = 'Logo URL must be 2048 characters or fewer.'

type AdminShopSortField = (typeof ADMIN_SHOPS_SORT_FIELDS)[number]
type AdminShopSortValue = `${AdminShopSortField}:${(typeof SORT_DIRECTIONS)[number]}`

const SORT_VALUES = ADMIN_SHOPS_SORT_FIELDS.flatMap((field) =>
  SORT_DIRECTIONS.map((direction) => `${field}:${direction}` as const),
) as [AdminShopSortValue, ...AdminShopSortValue[]]

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

export const createShopInputSchema = z.strictObject({
  slug: slugSchema,
  name: nameSchema,
  domain: domainSchema,
  logoUrl: logoUrlSchema,
  isAffiliated: z.boolean(),
  sortOrder: sortOrderSchema,
  isActive: z.boolean(),
})

export type CreateShopInput = z.infer<typeof createShopInputSchema>

export const updateShopInputSchema = createShopInputSchema.partial().omit({ slug: true })

export type UpdateShopInput = z.infer<typeof updateShopInputSchema>
