import { z } from 'zod'

export const shopSchema = z.object({
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

export type ApiShop = z.infer<typeof shopSchema>

const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
})

export const shopListResponseSchema = z.object({
  items: z.array(shopSchema),
  pagination: paginationSchema,
})

export type ShopListResponse = z.infer<typeof shopListResponseSchema>
