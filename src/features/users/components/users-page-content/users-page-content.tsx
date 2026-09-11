'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ClearFiltersButton,
  DataTable,
  DataTableFilters,
  DataTablePagination,
} from '@/components/shared/data-table'
import type { DataTableColumn, FilterDefinition } from '@/components/shared/data-table'
import { IconButton } from '@/components/shared/icon-button'
import { useListSearchParams } from '@/components/shared/use-list-search-params'
import { listUsersQuerySchema } from '@/data-access/users/users.schemas'
import type { AdminApiUser } from '@/data-access/_shared/schemas/admin-user'
import { formatDate } from '@/lib/format-date'
import { useUsers } from '@/features/users/hooks/use-users'
import { RoleBadge } from '@/features/users/components/role-badge'
import { ROLE_PARAM, RoleFilter } from '@/features/users/components/role-filter'
import { UserStatusBadge } from '@/features/users/components/user-status-badge'

const EMPTY_LABEL = 'No users match these filters.'

const USERS_FILTERS: FilterDefinition[] = [
  {
    type: 'text',
    paramName: 'email',
    label: 'Email',
    placeholder: 'Search by email…',
  },
  {
    type: 'text',
    paramName: 'username',
    label: 'Username',
    placeholder: 'Search by username…',
  },
]

const USERS_CLEARABLE_PARAMS = [...USERS_FILTERS.map((filter) => filter.paramName), ROLE_PARAM]

const USERS_COLUMNS: DataTableColumn<AdminApiUser>[] = [
  {
    key: 'avatar',
    header: '',
    className: 'w-10',
    cell: (user) => (
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.avatarUrl ?? undefined} alt={user.username ?? user.email} />
        <AvatarFallback className="text-xs">
          {resolveAvatarInitial(user)}
        </AvatarFallback>
      </Avatar>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    cell: (user) => <span className="font-medium">{user.email}</span>,
  },
  {
    key: 'username',
    header: 'Username',
    cell: (user) => (
      <span className="text-muted-foreground">{user.username ?? '—'}</span>
    ),
  },
  {
    key: 'role',
    header: 'Role',
    cell: (user) => <RoleBadge role={user.role} />,
  },
  {
    key: 'createdAt',
    header: 'Created',
    cell: (user) => formatDate(user.createdAt),
  },
  {
    key: 'lastActiveAt',
    header: 'Last active',
    cell: (user) => (user.lastActiveAt !== null ? formatDate(user.lastActiveAt) : '—'),
  },
  {
    key: 'status',
    header: 'Status',
    cell: (user) => (
      <UserStatusBadge deletedAt={user.deletedAt} bannedAt={user.bannedAt} />
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    className: 'w-28 text-right',
    cell: () => (
      <div className="flex justify-end gap-1">
        <IconButton label="Update user">
          <Pencil />
        </IconButton>
        <IconButton label="Delete user" tone="destructive">
          <Trash2 />
        </IconButton>
      </div>
    ),
  },
]

export function UsersPageContent(): React.JSX.Element {
  const filters = useListSearchParams(listUsersQuerySchema)
  const usersQuery = useUsers({
    page: filters.page,
    limit: filters.limit,
    email: filters.email,
    username: filters.username,
    role: filters.role,
    sort: filters.sort,
  })

  const data = usersQuery.data?.items ?? []
  const total = usersQuery.data?.pagination.total ?? 0

  return (
    <DataTable
      columns={USERS_COLUMNS}
      data={data}
      isLoading={usersQuery.isLoading}
      error={usersQuery.error}
      emptyLabel={EMPTY_LABEL}
      pageSize={filters.limit}
      onRetry={() => { void usersQuery.refetch() }}
      getRowClassName={resolveRowClassName}
      toolbar={
        <div className="flex flex-wrap items-center gap-3">
          <DataTableFilters filters={USERS_FILTERS} />
          <div className="h-6 w-px bg-border" />
          <RoleFilter />
          <ClearFiltersButton paramNames={USERS_CLEARABLE_PARAMS} />
        </div>
      }
      footer={
        <DataTablePagination
          page={filters.page}
          pageSize={filters.limit}
          total={total}
        />
      }
    />
  )
}

function resolveAvatarInitial(user: AdminApiUser): string {
  const source = user.username ?? user.email
  return source.charAt(0).toUpperCase()
}

function resolveRowClassName(user: AdminApiUser): string | undefined {
  if (user.deletedAt !== null) return 'opacity-50'
  return undefined
}
