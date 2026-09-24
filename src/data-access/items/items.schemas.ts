import { z } from 'zod'
import { MODERATION_STATUS_VALUES } from '@keimelion/api/shared/enums/moderation-status'

const NAME_MAX_LENGTH = 300
const DESCRIPTION_MAX_LENGTH = 5000
const IMAGE_URL_MAX_LENGTH = 2048
const HTTPS_URL_MESSAGE = 'HTTPS URL required'

const httpsUrlSchema = z
  .url()
  .max(IMAGE_URL_MAX_LENGTH)
  .refine((value) => value.startsWith('https://'), { message: HTTPS_URL_MESSAGE })
  .nullable()

export const adminItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  moderationStatus: z.enum(MODERATION_STATUS_VALUES),
  createdByUserId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
})

export type ApiAdminItem = z.infer<typeof adminItemSchema>

const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
})

export const adminItemListResponseSchema = z.object({
  items: z.array(adminItemSchema),
  pagination: paginationSchema,
})

export type AdminItemListResponse = z.infer<typeof adminItemListResponseSchema>

export const adminItemMutationResponseSchema = z.object({
  item: adminItemSchema,
})

export type AdminItemMutationResponse = z.infer<typeof adminItemMutationResponseSchema>

const SORT_VALUES = [
  'createdAt:desc',
  'createdAt:asc',
  'updatedAt:desc',
  'updatedAt:asc',
  'name:asc',
  'name:desc',
  'moderationStatus:asc',
  'moderationStatus:desc',
] as const

export const listItemsQuerySchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  limit: z.coerce.number().int().positive().catch(20),
  name: z.string().optional(),
  moderationStatus: z.enum(MODERATION_STATUS_VALUES).optional(),
  includeDeleted: z.coerce.boolean().optional(),
  sort: z.enum(SORT_VALUES).catch('createdAt:desc'),
})

export type ListItemsQuery = z.infer<typeof listItemsQuerySchema>

export const createItemInputSchema = z
  .object({
    name: z.string().trim().min(1).max(NAME_MAX_LENGTH),
    description: z.string().trim().max(DESCRIPTION_MAX_LENGTH).nullable(),
    imageUrl: httpsUrlSchema,
    moderationStatus: z.enum(MODERATION_STATUS_VALUES),
  })
  .strict()

export type CreateItemInput = z.infer<typeof createItemInputSchema>

export const updateItemInputSchema = createItemInputSchema

export type UpdateItemInput = z.infer<typeof updateItemInputSchema>
