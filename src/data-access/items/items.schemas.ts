import { z } from 'zod'
import { basePaginationShape } from '@/data-access/_shared/pagination'
import {
  apiItemSourceSchema,
  itemSourceInputSchema,
} from './item-sources.schemas'

const NAME_MIN_LENGTH = 1
const NAME_MAX_LENGTH = 300
const DESCRIPTION_MAX_LENGTH = 5000
const IMAGE_URL_MAX_LENGTH = 2048

const NAME_REQUIRED_MESSAGE = 'Name is required.'
const NAME_TOO_LONG_MESSAGE = 'Name must be 300 characters or fewer.'
const DESCRIPTION_TOO_LONG_MESSAGE = 'Description must be 5000 characters or fewer.'
const IMAGE_URL_INVALID_MESSAGE = 'Image URL must be a valid URL.'
const IMAGE_URL_HTTPS_MESSAGE = 'Image URL must use HTTPS.'
const IMAGE_URL_TOO_LONG_MESSAGE = 'Image URL must be 2048 characters or fewer.'
const SOURCES_MIN_MESSAGE = 'At least one source is required.'
const SOURCES_SHOP_DUPLICATE_MESSAGE = 'This shop is already used by another source.'

export const apiAdminItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  createdByUserId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  sources: z.array(apiItemSourceSchema),
})

export type ApiAdminItem = z.infer<typeof apiAdminItemSchema>

const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
})

export const adminItemListResponseSchema = z.object({
  items: z.array(apiAdminItemSchema),
  pagination: paginationSchema,
})

export type AdminItemListResponse = z.infer<typeof adminItemListResponseSchema>

export const adminItemMutationResponseSchema = z.object({
  item: apiAdminItemSchema,
})

export type AdminItemMutationResponse = z.infer<typeof adminItemMutationResponseSchema>

const SORTABLE_FIELDS = ['name', 'createdAt', 'updatedAt'] as const
const SORT_DIRECTIONS = ['asc', 'desc'] as const

export type AdminItemSortField = (typeof SORTABLE_FIELDS)[number]

const SORT_VALUES = SORTABLE_FIELDS.flatMap((field) =>
  SORT_DIRECTIONS.map((direction) => `${field}:${direction}` as const),
) as [
  `${AdminItemSortField}:${(typeof SORT_DIRECTIONS)[number]}`,
  ...`${AdminItemSortField}:${(typeof SORT_DIRECTIONS)[number]}`[],
]

export const listItemsQuerySchema = z.object({
  ...basePaginationShape,
  search: z.string().trim().min(1).optional(),
  sort: z.enum(SORT_VALUES).optional(),
})

export type ListItemsQuery = z.infer<typeof listItemsQuerySchema>

const nameSchema = z
  .string()
  .trim()
  .min(NAME_MIN_LENGTH, { message: NAME_REQUIRED_MESSAGE })
  .max(NAME_MAX_LENGTH, { message: NAME_TOO_LONG_MESSAGE })

const descriptionSchema = z
  .string()
  .trim()
  .max(DESCRIPTION_MAX_LENGTH, { message: DESCRIPTION_TOO_LONG_MESSAGE })
  .nullable()

const imageUrlSchema = z
  .url({ message: IMAGE_URL_INVALID_MESSAGE })
  .max(IMAGE_URL_MAX_LENGTH, { message: IMAGE_URL_TOO_LONG_MESSAGE })
  .refine((value) => value.startsWith('https://'), { message: IMAGE_URL_HTTPS_MESSAGE })
  .nullable()

export const createItemInputSchema = z
  .object({
    name: nameSchema,
    description: descriptionSchema,
    imageUrl: imageUrlSchema,
    sources: z.array(itemSourceInputSchema).min(1, { message: SOURCES_MIN_MESSAGE }),
  })
  .strict()
  .superRefine((value, context) => {
    const seenShopIndexByShopId = new Map<string, number>()
    value.sources.forEach((source, index) => {
      if (source.shopId === null) return
      const previousIndex = seenShopIndexByShopId.get(source.shopId)
      if (previousIndex === undefined) {
        seenShopIndexByShopId.set(source.shopId, index)
        return
      }
      context.addIssue({
        code: 'custom',
        message: SOURCES_SHOP_DUPLICATE_MESSAGE,
        path: ['sources', index, 'shopId'],
      })
    })
  })

export type CreateItemInput = z.infer<typeof createItemInputSchema>

export const updateItemInputSchema = z
  .object({
    name: nameSchema.optional(),
    description: descriptionSchema.optional(),
    imageUrl: imageUrlSchema.optional(),
  })
  .strict()

export type UpdateItemInput = z.infer<typeof updateItemInputSchema>
