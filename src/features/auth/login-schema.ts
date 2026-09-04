import { z } from 'zod'
import { apiUserSchema } from '@/data-access/_auth-storage'

const MIN_PASSWORD_LENGTH = 1

export const loginInputSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(MIN_PASSWORD_LENGTH),
})

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: apiUserSchema,
})

export type LoginInput = z.infer<typeof loginInputSchema>
export type LoginResponseParsed = z.infer<typeof loginResponseSchema>
