'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { useReorderMutation } from '@/components/shared/data-table'
import type { ReorderUpdate } from '@/components/shared/data-table'
import {
  OCCASION_TYPES_QUERY_KEY,
  createOccasionType,
  deleteOccasionType,
  listAdminOccasionTypes,
  patchOccasionTypeSortOrder,
  updateOccasionType,
} from '@/data-access/occasion-types/admin-occasion-types.api'
import type { CreateOccasionTypeInput, UpdateOccasionTypeInput } from '@/features/occasion-types/occasion-types.input-schemas'
import type { AdminOccasionTypeDetailParsed, PaginatedResponse } from '@keimelion/sdk/schemas'

interface UseAdminOccasionTypesParams {
  page: number
  limit: number
}

export function buildAdminOccasionTypesKey(
  params: UseAdminOccasionTypesParams,
): readonly ['occasion-types', 'admin', 'list', UseAdminOccasionTypesParams] {
  return [...OCCASION_TYPES_QUERY_KEY, 'admin', 'list', params] as const
}

export function useAdminOccasionTypes(
  params: UseAdminOccasionTypesParams,
): UseQueryResult<PaginatedResponse<AdminOccasionTypeDetailParsed>> {
  return useQuery({
    queryKey: buildAdminOccasionTypesKey(params),
    queryFn: () => listAdminOccasionTypes(params),
  })
}

export function useCreateOccasionType(): UseMutationResult<AdminOccasionTypeDetailParsed, Error, CreateOccasionTypeInput> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateOccasionTypeInput) => createOccasionType(input),
    meta: { silent: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: OCCASION_TYPES_QUERY_KEY })
    },
  })
}

interface UpdateOccasionTypeVariables {
  id: string
  input: UpdateOccasionTypeInput
}

export function useUpdateOccasionType(): UseMutationResult<AdminOccasionTypeDetailParsed, Error, UpdateOccasionTypeVariables> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }) => updateOccasionType(id, input),
    meta: { silent: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: OCCASION_TYPES_QUERY_KEY })
    },
  })
}

export function useDeleteOccasionType(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteOccasionType,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: OCCASION_TYPES_QUERY_KEY })
    },
  })
}

function reorderOccasionTypes(updates: ReorderUpdate[]): Promise<AdminOccasionTypeDetailParsed[]> {
  return Promise.all(updates.map(({ id, sortOrder }) => patchOccasionTypeSortOrder(id, sortOrder)))
}

export function useReorderOccasionTypes(
  params: UseAdminOccasionTypesParams,
): ReturnType<typeof useReorderMutation<AdminOccasionTypeDetailParsed>> {
  return useReorderMutation<AdminOccasionTypeDetailParsed>({
    queryKey: buildAdminOccasionTypesKey(params),
    invalidateKey: OCCASION_TYPES_QUERY_KEY,
    mutationFn: reorderOccasionTypes,
    errorMessageKey: 'common.reorder.error_message',
    successMessageKey: 'common.reorder.success_message',
  })
}
