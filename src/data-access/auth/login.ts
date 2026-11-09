import type { LoginRequestInput, LoginResponseParsed } from '@keimelion/sdk/schemas'
import { apiClient } from '@/data-access/_shared/client'

export async function login(input: LoginRequestInput): Promise<LoginResponseParsed> {
  return apiClient.auth.login(input)
}
