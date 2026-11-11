import type { HealthGetResponseParsed } from '@keimelion/sdk/schemas'
import { apiClient } from '@/data-access/_shared/client'

export async function fetchHealth(): Promise<HealthGetResponseParsed> {
  return apiClient.health.get()
}
