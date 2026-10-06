import { z } from 'zod'

const SOURCE_URL_MAX_LENGTH = 2048
const PRICE_REGEX = /^\d{1,8}(\.\d{1,2})?$/
const CURRENCY_REGEX = /^[A-Z]{3}$/
const CURRENCY_LENGTH = 3
const DEFAULT_CURRENCY = 'EUR'

export const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'AUD', 'JPY'] as const
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

const SOURCE_URL_INVALID_MESSAGE = 'Source URL must be a valid URL.'
const SOURCE_URL_HTTPS_MESSAGE = 'Source URL must use HTTPS.'
const SOURCE_URL_TOO_LONG_MESSAGE = 'Source URL must be 2048 characters or fewer.'
const SOURCE_IDENTIFIER_REQUIRED_MESSAGE = 'A source must have either a URL or a shop.'
const PRICE_INVALID_MESSAGE = 'Price must be a decimal with up to 8 digits before the dot and 2 after (e.g. 19.99).'
const CURRENCY_INVALID_MESSAGE = 'Currency must be a 3-letter uppercase ISO code (e.g. EUR).'

const shopPublicSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  domain: z.string().nullable(),
  logoUrl: z.string().nullable(),
  isAffiliated: z.boolean(),
})

export type ItemSourceShop = z.infer<typeof shopPublicSchema>

export const apiItemSourceSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  shopId: z.string().nullable(),
  shop: shopPublicSchema.nullable(),
  sourceUrl: z.string().nullable(),
  price: z.string().nullable(),
  currency: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ApiItemSource = z.infer<typeof apiItemSourceSchema>

const httpsSourceUrlSchema = z
  .url({ message: SOURCE_URL_INVALID_MESSAGE })
  .max(SOURCE_URL_MAX_LENGTH, { message: SOURCE_URL_TOO_LONG_MESSAGE })
  .refine((value) => value.startsWith('https://'), { message: SOURCE_URL_HTTPS_MESSAGE })

const priceSchema = z
  .string()
  .regex(PRICE_REGEX, { message: PRICE_INVALID_MESSAGE })

const currencySchema = z
  .string()
  .length(CURRENCY_LENGTH, { message: CURRENCY_INVALID_MESSAGE })
  .regex(CURRENCY_REGEX, { message: CURRENCY_INVALID_MESSAGE })

const itemSourceInputObjectSchema = z
  .object({
    shopId: z.uuid().nullable(),
    sourceUrl: httpsSourceUrlSchema.nullable(),
    price: priceSchema.nullable(),
    currency: currencySchema,
  })
  .strict()

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

export const createItemSourceInputSchema = itemSourceInputSchema

export type CreateItemSourceInput = z.infer<typeof createItemSourceInputSchema>

export const updateItemSourceInputSchema = itemSourceInputObjectSchema.partial()

export type UpdateItemSourceInput = z.infer<typeof updateItemSourceInputSchema>

export const itemSourceMutationResponseSchema = z.object({
  source: apiItemSourceSchema,
})

export type ItemSourceMutationResponse = z.infer<typeof itemSourceMutationResponseSchema>

export const EMPTY_ITEM_SOURCE_INPUT: ItemSourceInput = {
  shopId: null,
  sourceUrl: null,
  price: null,
  currency: DEFAULT_CURRENCY,
}
