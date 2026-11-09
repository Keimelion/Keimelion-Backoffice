import { apiClient } from '@/data-access/_shared/client'

export async function logout(): Promise<void> {
  await apiClient.auth.logout()
}
