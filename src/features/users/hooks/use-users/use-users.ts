'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { normalizeFilters } from '@/data-access/_shared/normalize-filters'
import {
  ADMIN_USERS_QUERY_KEY,
  createAdminUser,
  deleteAdminUser,
  listUsers,
  resendStaffInvitation,
  updateAdminUser,
} from '@/data-access/users/admin-users.api'
import type { ListUsersQuery } from '@/features/users/users.input-schemas'
import type { AdminUserDetailParsed, AdminUsersCreateRequestInput, AdminUsersUpdateRequestInput, PaginatedResponse } from '@keimelion/sdk/schemas'

type UsersListFilters = Partial<ListUsersQuery>

export function buildUsersListKey(
  filters: UsersListFilters,
): readonly ['users', 'list', UsersListFilters] {
  const normalized = normalizeFilters(filters)
  return [...USERS_LIST_QUERY_KEY, normalized] as const
}

const USERS_LIST_QUERY_KEY = [...ADMIN_USERS_QUERY_KEY, 'list'] as const

export function useUsers(filters: UsersListFilters): UseQueryResult<PaginatedResponse<AdminUserDetailParsed>> {
  return useQuery({
    queryKey: buildUsersListKey(filters),
    queryFn: () => listUsers(filters),
  })
}

export function useCreateAdminUser(): UseMutationResult<AdminUserDetailParsed, Error, AdminUsersCreateRequestInput> {
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
  input: AdminUsersUpdateRequestInput
}

export function useUpdateAdminUser(): UseMutationResult<AdminUserDetailParsed, Error, UpdateAdminUserVariables> {
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

export function useResendStaffInvitation(): UseMutationResult<AdminUserDetailParsed, Error, string> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: resendStaffInvitation,
    meta: { silent: true },
    onSuccess: (user) => {
      queryClient.setQueriesData<PaginatedResponse<AdminUserDetailParsed>>(
        { queryKey: USERS_LIST_QUERY_KEY },
        (page) => replaceUserInPage(page, user),
      )
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
    },
  })
}

function replaceUserInPage(
  page: PaginatedResponse<AdminUserDetailParsed> | undefined,
  user: AdminUserDetailParsed,
): PaginatedResponse<AdminUserDetailParsed> | undefined {
  if (page === undefined) return undefined
  return {
    ...page,
    items: page.items.map((item) => (item.id === user.id ? user : item)),
  }
}
