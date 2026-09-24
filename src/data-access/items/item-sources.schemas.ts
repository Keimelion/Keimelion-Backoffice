import { z } from 'zod'

const SOURCE_URL_MAX_LENGTH = 2048
const PRICE_REGEX = /^\d{1,8}(\.\d{1,2})?$/
const CURRENCY_REGEX = /^[A-Z]{3}$/
const HTTPS_URL_MESSAGE = 'HTTPS URL required'

const httpsSourceUrlSchema = z
  .url()
  .max(SOURCE_URL_MAX_LENGTH)
  .refine((value) => value.startsWith('https://'), { message: HTTPS_URL_MESSAGE })
  .nullable()

const priceSchema = z.string().regex(PRICE_REGEX).nullable()
const currencySchema = z.string().regex(CURRENCY_REGEX)
const shopIdSchema = z.uuid().nullable()

export const itemSourceSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  shopId: z.string().nullable(),
  sourceUrl: z.string().nullable(),
  price: z.string().nullable(),
  currency: z.string(),
  isPrimary: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ApiItemSource = z.infer<typeof itemSourceSchema>

export const itemSourceListResponseSchema = z.object({
  sources: z.array(itemSourceSchema),
})

export type ItemSourceListResponse = z.infer<typeof itemSourceListResponseSchema>

export const itemSourceMutationResponseSchema = z.object({
  source: itemSourceSchema,
})

export type ItemSourceMutationResponse = z.infer<typeof itemSourceMutationResponseSchema>

export const createItemSourceInputSchema = z
  .object({
    shopId: shopIdSchema,
    sourceUrl: httpsSourceUrlSchema,
    price: priceSchema,
    currency: currencySchema,
    isPrimary: z.boolean(),
  })
  .strict()

export type CreateItemSourceInput = z.infer<typeof createItemSourceInputSchema>

export const updateItemSourceInputSchema = createItemSourceInputSchema

export type UpdateItemSourceInput = z.infer<typeof updateItemSourceInputSchema>
