import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import {
  adminShopListResponseSchema,
  adminShopMutationResponseSchema,
  type AdminShop,
  type CreateShopInput,
  type ListShopsQuery,
  type UpdateShopInput,
} from './admin-shops.schemas'

export const SHOPS_QUERY_KEY = ['shops'] as const

function buildListParams(input: Partial<ListShopsQuery>): Record<string, string> {
  const params: Record<string, string> = {}
  if (input.page !== undefined) params.page = String(input.page)
  if (input.limit !== undefined) params.limit = String(input.limit)
  if (typeof input.search === 'string' && input.search.length > 0) {
    params['name[ilike]'] = input.search
  }
  if (input.isActive !== undefined) {
    params['isActive[eq]'] = String(input.isActive)
  }
  if (input.isAffiliated !== undefined) {
    params['isAffiliated[eq]'] = String(input.isAffiliated)
  }
  if (input.sort !== undefined) params.sort = input.sort
  return params
}

export async function listAdminShops(
  input: Partial<ListShopsQuery>,
): Promise<PaginatedResponse<AdminShop>> {
  const response = await axiosInstance.get<unknown>('/admin/shops', {
    params: buildListParams(input),
  })
  return parseApiResponse(adminShopListResponseSchema, response, 'admin shops')
}

function normalizeNullableString(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeCreatePayload(input: CreateShopInput): CreateShopInput {
  return {
    ...input,
    domain: input.domain === null ? null : normalizeNullableString(input.domain) ?? null,
    logoUrl: input.logoUrl === null ? null : normalizeNullableString(input.logoUrl) ?? null,
  }
}

function normalizeUpdatePayload(input: UpdateShopInput): UpdateShopInput {
  const payload: UpdateShopInput = { ...input }
  if ('domain' in input) {
    const normalized = normalizeNullableString(input.domain)
    if (normalized === undefined) delete payload.domain
    else payload.domain = normalized
  }
  if ('logoUrl' in input) {
    const normalized = normalizeNullableString(input.logoUrl)
    if (normalized === undefined) delete payload.logoUrl
    else payload.logoUrl = normalized
  }
  return payload
}

export async function createShop(input: CreateShopInput): Promise<AdminShop> {
  const response = await axiosInstance.post<unknown>('/admin/shops', normalizeCreatePayload(input))
  const parsed = parseApiResponse(adminShopMutationResponseSchema, response, 'admin shop')
  return parsed.shop
}

export async function updateShop(id: string, input: UpdateShopInput): Promise<AdminShop> {
  const response = await axiosInstance.patch<unknown>(`/admin/shops/${id}`, normalizeUpdatePayload(input))
  const parsed = parseApiResponse(adminShopMutationResponseSchema, response, 'admin shop')
  return parsed.shop
}

export async function deleteShop(id: string): Promise<void> {
  await axiosInstance.delete<unknown>(`/admin/shops/${id}`)
}
