import { z } from 'zod'
import { axiosInstance } from '@/data-access/_shared/axios'

export const forgotPasswordInputSchema = z.object({
  email: z
    .email({ message: 'Enter a valid email address.' })
    .transform((value) => value.trim().toLowerCase()),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>

export async function forgotPassword(input: ForgotPasswordInput): Promise<void> {
  await axiosInstance.post('/auth/forgot-password', input)
}
