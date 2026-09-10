import { z } from 'zod'
import { apiUserSchema } from '@/data-access/_schemas/user'

export const adminUserSchema = apiUserSchema.extend({
  bannedAt: z.string().nullable(),
  banReason: z.string().nullable(),
  deletedAt: z.string().nullable(),
})

export type AdminApiUser = z.infer<typeof adminUserSchema>
