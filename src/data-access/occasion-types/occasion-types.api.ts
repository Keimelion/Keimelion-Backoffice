import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import {
  listOccasionTypesResponseSchema,
  type ApiOccasionType,
} from './occasion-types.schemas'

export async function fetchOccasionTypes(): Promise<ApiOccasionType[]> {
  const response = await axiosInstance.get<unknown>('/occasion-types')
  return parseApiResponse(listOccasionTypesResponseSchema, response, 'occasion types')
}
