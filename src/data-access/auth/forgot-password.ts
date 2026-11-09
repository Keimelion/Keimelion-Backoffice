import type { ForgotPasswordRequestInput } from '@keimelion/sdk/schemas'
import { apiClient } from '@/data-access/_shared/client'

export async function forgotPassword(input: ForgotPasswordRequestInput): Promise<void> {
  await apiClient.auth.forgotPassword(input)
}
