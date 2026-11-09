import { z } from 'zod'
import { SUPPORTED_CURRENCY_VALUES, SupportedCurrencies } from '@keimelion/sdk/enums'
import type { SupportedCurrency } from '@keimelion/sdk/enums'
import {
  ADMIN_ITEMS_SORT_FIELDS,
  MAX_CATEGORIES_PER_ITEM,
  MAX_ITEM_DESCRIPTION_LENGTH,
  MAX_ITEM_NAME_LENGTH,
  MAX_TAG_NAME_LENGTH,
  MAX_TAGS_PER_RESOURCE,
  SORT_DIRECTIONS,
} from '@keimelion/sdk/schemas'
import { basePaginationShape } from '@/data-access/_shared/pagination'

const SOURCE_URL_MAX_LENGTH = 2048
const PRICE_REGEX = /^\d{1,8}(\.\d{1,2})?$/
const NAME_MIN_LENGTH = 1

const SOURCE_URL_INVALID_MESSAGE = 'Source URL must be a valid URL.'
const SOURCE_URL_HTTPS_MESSAGE = 'Source URL must use HTTPS.'
const SOURCE_URL_TOO_LONG_MESSAGE = 'Source URL must be 2048 characters or fewer.'
const SOURCE_IDENTIFIER_REQUIRED_MESSAGE = 'A source must have either a URL or a shop.'
const PRICE_INVALID_MESSAGE =
  'Price must be a decimal with up to 8 digits before the dot and 2 after (e.g. 19.99).'
const CURRENCY_INVALID_MESSAGE = 'Currency must be a 3-letter uppercase ISO code (e.g. EUR).'
const NAME_REQUIRED_MESSAGE = 'Name is required.'
const NAME_TOO_LONG_MESSAGE = `Name must be ${String(MAX_ITEM_NAME_LENGTH)} characters or fewer.`
const DESCRIPTION_TOO_LONG_MESSAGE = `Description must be ${String(MAX_ITEM_DESCRIPTION_LENGTH)} characters or fewer.`
const SOURCES_MIN_MESSAGE = 'At least one source is required.'
const SOURCES_SHOP_DUPLICATE_MESSAGE = 'This shop is already used by another source.'
const CATEGORIES_MAX_MESSAGE = `An item can have at most ${String(MAX_CATEGORIES_PER_ITEM)} categories.`
const CATEGORY_ID_INVALID_MESSAGE = 'Category id must be a UUID.'
const TAGS_MAX_MESSAGE = `An item can have at most ${String(MAX_TAGS_PER_RESOURCE)} tags.`
const TAG_NAME_REQUIRED_MESSAGE = 'Tag name is required.'
const TAG_NAME_TOO_LONG_MESSAGE = `Tag name must be ${String(MAX_TAG_NAME_LENGTH)} characters or fewer.`

const httpsSourceUrlSchema = z
  .url({ message: SOURCE_URL_INVALID_MESSAGE })
  .max(SOURCE_URL_MAX_LENGTH, { message: SOURCE_URL_TOO_LONG_MESSAGE })
  .refine((value) => value.startsWith('https://'), { message: SOURCE_URL_HTTPS_MESSAGE })

const priceSchema = z.string().regex(PRICE_REGEX, { message: PRICE_INVALID_MESSAGE })

const currencySchema = z.enum(SUPPORTED_CURRENCY_VALUES, { message: CURRENCY_INVALID_MESSAGE })

const itemSourceInputObjectSchema = z.strictObject({
  shopId: z.uuid().nullable(),
  sourceUrl: httpsSourceUrlSchema.nullable(),
  price: priceSchema.nullable(),
  currency: currencySchema,
})

export const itemSourceInputSchema = itemSourceInputObjectSchema.superRefine((value, context) => {
  if (value.shopId === null && value.sourceUrl === null) {
    context.addIssue({
      code: 'custom',
      message: SOURCE_IDENTIFIER_REQUIRED_MESSAGE,
      path: ['sourceUrl'],
    })
  }
})

export type ItemSourceInput = z.infer<typeof itemSourceInputSchema>

export function toSupportedCurrency(currency: string): SupportedCurrency {
  const parsed = currencySchema.safeParse(currency)
  return parsed.success ? parsed.data : SupportedCurrencies.EUR
}

export const EMPTY_ITEM_SOURCE_INPUT: ItemSourceInput = {
  shopId: null,
  sourceUrl: null,
  price: null,
  currency: SupportedCurrencies.EUR,
}

type AdminItemSortField = (typeof ADMIN_ITEMS_SORT_FIELDS)[number]
type AdminItemSortValue = `${AdminItemSortField}:${(typeof SORT_DIRECTIONS)[number]}`

const SORT_VALUES = ADMIN_ITEMS_SORT_FIELDS.flatMap((field) =>
  SORT_DIRECTIONS.map((direction) => `${field}:${direction}` as const),
) as [AdminItemSortValue, ...AdminItemSortValue[]]

export const listItemsQuerySchema = z.object({
  ...basePaginationShape,
  id: z.uuid().optional(),
  search: z.string().trim().min(1).optional(),
  sort: z.enum(SORT_VALUES).optional(),
})

export type ListItemsQuery = z.infer<typeof listItemsQuerySchema>

const nameSchema = z
  .string()
  .trim()
  .min(NAME_MIN_LENGTH, { message: NAME_REQUIRED_MESSAGE })
  .max(MAX_ITEM_NAME_LENGTH, { message: NAME_TOO_LONG_MESSAGE })

const descriptionSchema = z
  .string()
  .trim()
  .max(MAX_ITEM_DESCRIPTION_LENGTH, { message: DESCRIPTION_TOO_LONG_MESSAGE })
  .nullable()

const categoriesSchema = z
  .array(z.uuid({ message: CATEGORY_ID_INVALID_MESSAGE }))
  .max(MAX_CATEGORIES_PER_ITEM, { message: CATEGORIES_MAX_MESSAGE })

const tagNameSchema = z
  .string()
  .trim()
  .min(1, { message: TAG_NAME_REQUIRED_MESSAGE })
  .max(MAX_TAG_NAME_LENGTH, { message: TAG_NAME_TOO_LONG_MESSAGE })

const tagsSchema = z.array(tagNameSchema).max(MAX_TAGS_PER_RESOURCE, { message: TAGS_MAX_MESSAGE })

const imageFileSchema = z.file().nullable()

export const createItemInputSchema = z
  .strictObject({
    name: nameSchema,
    description: descriptionSchema,
    image: imageFileSchema,
    clearImage: z.boolean().optional(),
    sources: z.array(itemSourceInputSchema).min(1, { message: SOURCES_MIN_MESSAGE }),
    categories: categoriesSchema.optional(),
    tags: tagsSchema.optional(),
  })
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

const editableItemFieldsShape = {
  name: nameSchema.optional(),
  description: descriptionSchema.optional(),
  image: imageFileSchema.optional(),
  clearImage: z.boolean().optional(),
  categories: categoriesSchema.optional(),
  tags: tagsSchema.optional(),
}

export const updateItemInputSchema = z.strictObject(editableItemFieldsShape)

export type UpdateItemInput = z.infer<typeof updateItemInputSchema>

export const editItemFormResolverSchema = z.object(editableItemFieldsShape)
