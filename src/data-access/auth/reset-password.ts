import { apiClient } from '@/data-access/_shared/client'

export const RESET_PASSWORD_INVALID_TOKEN_CODE = 'INVALID_RESET_TOKEN'

export interface ResetPasswordApiInput {
  token: string
  newPassword: string
}

export async function resetPassword(input: ResetPasswordApiInput): Promise<void> {
  await apiClient.auth.resetPassword({
    passwordResetToken: input.token,
    password: input.newPassword,
  })
}
