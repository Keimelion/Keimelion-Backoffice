import type { OccasionTypesListResponseParsed } from '@keimelion/sdk/schemas'
import { apiClient } from '@/data-access/_shared/client'

export async function fetchOccasionTypes(): Promise<OccasionTypesListResponseParsed> {
  return apiClient.occasionTypes.list()
}
