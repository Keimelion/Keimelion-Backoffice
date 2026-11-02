import { z } from 'zod'

export const apiOccasionTypeSchema = z.object({
  id: z.string(),
  slug: z.string(),
  label: z.string(),
  emoji: z.string().nullable(),
})

export type ApiOccasionType = z.infer<typeof apiOccasionTypeSchema>

export const listOccasionTypesResponseSchema = z.array(apiOccasionTypeSchema)
