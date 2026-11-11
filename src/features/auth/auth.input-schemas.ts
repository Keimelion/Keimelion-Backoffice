import { z } from 'zod'
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '@keimelion/sdk/schemas'

const emailSchema = z
  .email({ message: 'Enter a valid email address.' })
  .transform((value) => value.trim().toLowerCase())

export const loginInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required.' }),
})

export type LoginInput = z.infer<typeof loginInputSchema>

export const forgotPasswordInputSchema = z.object({ email: emailSchema })

export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>

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

export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>
