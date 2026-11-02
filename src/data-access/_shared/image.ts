import { z } from 'zod'

export const apiImageUrlsSchema = z.object({
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
})

export const apiImageDetailSchema = z.object({
  id: z.string(),
  hash: z.string(),
  mime: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  width: z.number().int().nonnegative(),
  height: z.number().int().nonnegative(),
  createdAt: z.string(),
  urls: apiImageUrlsSchema,
})

export type ApiImageDetail = z.infer<typeof apiImageDetailSchema>
export type ApiImageUrls = z.infer<typeof apiImageUrlsSchema>
