import { z } from 'zod'
import { LIST_STATUS_VALUES } from '@keimelion/api/shared/enums/list-status'
import { basePaginationShape } from '@/data-access/_shared/pagination'
import { apiTagSchema } from '@/data-access/tags/tags.schemas'
import { apiUserSchema } from '@/data-access/_shared/user'
import { apiItemSourceSchema } from '@/data-access/items/item-sources.schemas'
import { apiItemCategorySchema } from '@/data-access/items/items.schemas'

const TITLE_MIN_LENGTH = 1
const TITLE_MAX_LENGTH = 200
const DESCRIPTION_MAX_LENGTH = 5000
export const LIST_TAGS_MAX = 20
export const LIST_TAG_NAME_MAX_LENGTH = 50

const TITLE_REQUIRED_MESSAGE = 'Title is required.'
const TITLE_TOO_LONG_MESSAGE = 'Title must be 200 characters or fewer.'
const DESCRIPTION_TOO_LONG_MESSAGE = 'Description must be 5000 characters or fewer.'
const OCCASION_TYPE_INVALID_MESSAGE = 'Occasion type must be a valid identifier.'
const TAGS_MAX_MESSAGE = `A list can have at most ${String(LIST_TAGS_MAX)} tags.`
const TAG_NAME_REQUIRED_MESSAGE = 'Tag name is required.'
const TAG_NAME_TOO_LONG_MESSAGE = `Tag name must be ${String(LIST_TAG_NAME_MAX_LENGTH)} characters or fewer.`

export const apiAdminListSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  listStatus: z.enum(LIST_STATUS_VALUES),
  occasionTypeId: z.string().nullable(),
  owner: apiUserSchema.nullable(),
  tags: z.array(apiTagSchema).default([]),
  itemCount: z.number().int().nonnegative(),
  totalEstimatedPrice: z.string().nullable(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ApiAdminList = z.infer<typeof apiAdminListSchema>

const apiListItemBaseSchema = z.object({
  id: z.string(),
  listId: z.string(),
  itemId: z.string(),
  quantityDesired: z.number().int(),
  quantityReservedTotal: z.number().int(),
  itemStatus: z.string(),
  sortOrder: z.number().nullable(),
  creatorNote: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const apiListItemInnerItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  createdByUserId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  tags: z.array(apiTagSchema).default([]),
  categories: z.array(apiItemCategorySchema).default([]),
})

export const apiAdminListItemSchema = apiListItemBaseSchema.extend({
  item: apiListItemInnerItemSchema,
  sources: z.array(apiItemSourceSchema),
})

export type ApiAdminListItem = z.infer<typeof apiAdminListItemSchema>

const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
})

export const adminListListResponseSchema = z.object({
  items: z.array(apiAdminListSchema),
  pagination: paginationSchema,
})

export type AdminListListResponse = z.infer<typeof adminListListResponseSchema>

export const adminListMutationResponseSchema = z.object({
  list: apiAdminListSchema,
})

export type AdminListMutationResponse = z.infer<typeof adminListMutationResponseSchema>

export const adminListItemsListResponseSchema = z.object({
  items: z.array(apiAdminListItemSchema),
  pagination: paginationSchema,
})

export type AdminListItemsListResponse = z.infer<typeof adminListItemsListResponseSchema>

const SORTABLE_FIELDS = ['title', 'createdAt', 'updatedAt'] as const
const SORT_DIRECTIONS = ['asc', 'desc'] as const

export type AdminListSortField = (typeof SORTABLE_FIELDS)[number]

const SORT_VALUES = SORTABLE_FIELDS.flatMap((field) =>
  SORT_DIRECTIONS.map((direction) => `${field}:${direction}` as const),
) as [
  `${AdminListSortField}:${(typeof SORT_DIRECTIONS)[number]}`,
  ...`${AdminListSortField}:${(typeof SORT_DIRECTIONS)[number]}`[],
]

export const listListsQuerySchema = z.object({
  ...basePaginationShape,
  search: z.string().trim().min(1).optional(),
  listStatus: z.enum(LIST_STATUS_VALUES).optional(),
  occasionTypeId: z.uuid().optional(),
  ownerUserId: z.uuid().optional(),
  sort: z.enum(SORT_VALUES).optional(),
})

export type ListListsQuery = z.infer<typeof listListsQuerySchema>

const titleSchema = z
  .string()
  .trim()
  .min(TITLE_MIN_LENGTH, { message: TITLE_REQUIRED_MESSAGE })
  .max(TITLE_MAX_LENGTH, { message: TITLE_TOO_LONG_MESSAGE })

const descriptionSchema = z
  .string()
  .trim()
  .max(DESCRIPTION_MAX_LENGTH, { message: DESCRIPTION_TOO_LONG_MESSAGE })
  .nullable()

const occasionTypeIdSchema = z.uuid({ message: OCCASION_TYPE_INVALID_MESSAGE }).nullable()

const tagNameSchema = z
  .string()
  .trim()
  .min(1, { message: TAG_NAME_REQUIRED_MESSAGE })
  .max(LIST_TAG_NAME_MAX_LENGTH, { message: TAG_NAME_TOO_LONG_MESSAGE })

const tagsSchema = z
  .array(tagNameSchema)
  .max(LIST_TAGS_MAX, { message: TAGS_MAX_MESSAGE })

const editableListFieldsShape = {
  title: titleSchema.optional(),
  description: descriptionSchema.optional(),
  occasionTypeId: occasionTypeIdSchema.optional(),
  tags: tagsSchema.optional(),
}

export const updateListInputSchema = z.object(editableListFieldsShape).strict()

export type UpdateListInput = z.infer<typeof updateListInputSchema>

export const editListFormResolverSchema = z.object(editableListFieldsShape)

export const listItemsQuerySchema = z.object({
  ...basePaginationShape,
})

export type ListItemsPaginationQuery = z.infer<typeof listItemsQuerySchema>
