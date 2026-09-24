import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import { shopListResponseSchema, type ApiShop } from './shops.schemas'

export const SHOPS_QUERY_KEY = ['shops'] as const

const SHOPS_PICKER_LIMIT = 100

export async function fetchShops(): Promise<ApiShop[]> {
  const response = await axiosInstance.get<unknown>('/admin/shops', {
    params: { limit: SHOPS_PICKER_LIMIT },
  })
  const parsed = parseApiResponse(shopListResponseSchema, response, 'admin shops')
  return parsed.items
}
