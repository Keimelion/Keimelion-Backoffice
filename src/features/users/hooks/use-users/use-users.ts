'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { normalizeFilters } from '@/data-access/_shared/normalize-filters'
import {
  ADMIN_USERS_QUERY_KEY,
  createAdminUser,
  deleteAdminUser,
  listUsers,
  updateAdminUser,
} from '@/data-access/users/admin-users.api'
import type {
  AdminApiUser,
  AdminUserMutationUser,
  CreateAdminUserInput,
  ListUsersQuery,
  UpdateAdminUserInput,
} from '@/data-access/users/admin-users.schemas'

type UsersListFilters = Partial<ListUsersQuery>

export function buildUsersListKey(
  filters: UsersListFilters,
): readonly ['users', 'list', UsersListFilters] {
  const normalized = normalizeFilters(filters)
  return [...ADMIN_USERS_QUERY_KEY, 'list', normalized] as const
}

export function useUsers(filters: UsersListFilters): UseQueryResult<PaginatedResponse<AdminApiUser>> {
  return useQuery({
    queryKey: buildUsersListKey(filters),
    queryFn: () => listUsers(filters),
  })
}

export function useCreateAdminUser(): UseMutationResult<AdminUserMutationUser, Error, CreateAdminUserInput> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAdminUser,
    meta: { silent: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
    },
  })
}

interface UpdateAdminUserVariables {
  id: string
  input: UpdateAdminUserInput
}

export function useUpdateAdminUser(): UseMutationResult<AdminUserMutationUser, Error, UpdateAdminUserVariables> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }) => updateAdminUser(id, input),
    meta: { silent: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
    },
  })
}

export function useDeleteAdminUser(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
    },
  })
}
