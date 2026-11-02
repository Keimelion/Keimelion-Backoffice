import { z } from 'zod'
import { axiosInstance } from '@/data-access/_shared/axios'

const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 72

export const RESET_PASSWORD_INVALID_TOKEN_CODE = 'INVALID_RESET_TOKEN'

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

export interface ResetPasswordApiInput {
  token: string
  newPassword: string
}

export async function resetPassword(input: ResetPasswordApiInput): Promise<void> {
  await axiosInstance.post('/auth/reset-password', {
    passwordResetToken: input.token,
    password: input.newPassword,
  })
}
