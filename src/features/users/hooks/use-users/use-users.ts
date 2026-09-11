'use client'

import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { fetchUsers } from '@/data-access/users/users.api'
import type { AdminApiUser } from '@/data-access/_shared/schemas/admin-user'
import type { ListUsersQuery } from '@/data-access/users/users.schemas'

type UsersListFilters = Partial<ListUsersQuery>

export function buildUsersListKey(filters: UsersListFilters): ['users', 'list', UsersListFilters] {
  const normalized = normalizeFilters(filters)
  return ['users', 'list', normalized]
}

export function useUsers(filters: UsersListFilters): UseQueryResult<PaginatedResponse<AdminApiUser>> {
  return useQuery({
    queryKey: buildUsersListKey(filters),
    queryFn: () => fetchUsers(filters),
  })
}

function normalizeFilters(filters: UsersListFilters): UsersListFilters {
  const entries = Object.entries(filters) as [keyof UsersListFilters, UsersListFilters[keyof UsersListFilters]][]
  const normalized = entries
    .filter(([, value]) => value !== undefined && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
  return Object.fromEntries(normalized)
}
