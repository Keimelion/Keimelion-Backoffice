import { z } from 'zod'
import { apiUserSchema } from '@/data-access/_shared/schemas/user'

const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 72

export const loginInputSchema = z.object({
  email: z
    .email({ message: 'Enter a valid email address.' })
    .transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1, { message: 'Password is required.' }),
})

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: apiUserSchema,
})

export const forgotPasswordInputSchema = z.object({
  email: z
    .email({ message: 'Enter a valid email address.' })
    .transform((value) => value.trim().toLowerCase()),
})

export const resetPasswordInputSchema = z
  .object({
    newPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, {
        message: `Password must be at least ${String(MIN_PASSWORD_LENGTH)} characters.`,
      })
      .max(MAX_PASSWORD_LENGTH, {
        message: `Password must be at most ${String(MAX_PASSWORD_LENGTH)} characters.`,
      }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password.' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export const refreshInputSchema = z.object({
  refreshToken: z.string().min(1),
})

export const refreshResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export type LoginInput = z.infer<typeof loginInputSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>
export type RefreshInput = z.infer<typeof refreshInputSchema>
export type RefreshResponse = z.infer<typeof refreshResponseSchema>
