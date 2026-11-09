import { z } from 'zod'
import { LIST_STATUS_VALUES } from '@keimelion/sdk/enums'
import {
  LIST_SORT_FIELDS,
  MAX_LIST_TITLE_LENGTH,
  MAX_TAG_NAME_LENGTH,
  MAX_TAGS_PER_RESOURCE,
  SORT_DIRECTIONS,
} from '@keimelion/sdk/schemas'
import { basePaginationShape } from '@/data-access/_shared/pagination'

const TITLE_MIN_LENGTH = 1
const DESCRIPTION_MAX_LENGTH = 5000

const TITLE_REQUIRED_MESSAGE = 'Title is required.'
const TITLE_TOO_LONG_MESSAGE = `Title must be ${String(MAX_LIST_TITLE_LENGTH)} characters or fewer.`
const DESCRIPTION_TOO_LONG_MESSAGE = `Description must be ${String(DESCRIPTION_MAX_LENGTH)} characters or fewer.`
const OCCASION_TYPE_INVALID_MESSAGE = 'Occasion type must be a valid identifier.'
const TAGS_MAX_MESSAGE = `A list can have at most ${String(MAX_TAGS_PER_RESOURCE)} tags.`
const TAG_NAME_REQUIRED_MESSAGE = 'Tag name is required.'
const TAG_NAME_TOO_LONG_MESSAGE = `Tag name must be ${String(MAX_TAG_NAME_LENGTH)} characters or fewer.`

type AdminListSortField = (typeof LIST_SORT_FIELDS)[number]
type AdminListSortValue = `${AdminListSortField}:${(typeof SORT_DIRECTIONS)[number]}`

const SORT_VALUES = LIST_SORT_FIELDS.flatMap((field) =>
  SORT_DIRECTIONS.map((direction) => `${field}:${direction}` as const),
) as [AdminListSortValue, ...AdminListSortValue[]]

export const listListsQuerySchema = z.object({
  ...basePaginationShape,
  id: z.uuid().optional(),
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
  .max(MAX_LIST_TITLE_LENGTH, { message: TITLE_TOO_LONG_MESSAGE })

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
  .max(MAX_TAG_NAME_LENGTH, { message: TAG_NAME_TOO_LONG_MESSAGE })

const tagsSchema = z.array(tagNameSchema).max(MAX_TAGS_PER_RESOURCE, { message: TAGS_MAX_MESSAGE })

const editableListFieldsShape = {
  title: titleSchema.optional(),
  description: descriptionSchema.optional(),
  occasionTypeId: occasionTypeIdSchema.optional(),
  tags: tagsSchema.optional(),
}

export const updateListInputSchema = z.strictObject(editableListFieldsShape)

export type UpdateListInput = z.infer<typeof updateListInputSchema>

export const editListFormResolverSchema = z.object(editableListFieldsShape)

export const listItemsPaginationQuerySchema = z.object({ ...basePaginationShape })

export type ListItemsPaginationQuery = z.infer<typeof listItemsPaginationQuerySchema>
