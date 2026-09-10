'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/data-table'
import type { DataTableColumn } from '@/components/shared/data-table'
import { DataTableFilters } from '@/components/shared/data-table-filters'
import type { FilterDefinition } from '@/components/shared/data-table-filters'
import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { useListSearchParams } from '@/components/shared/use-list-search-params'
import { listUsersQuerySchema } from '@/data-access/users/users.schemas'
import type { AdminApiUser } from '@/data-access/_schemas/admin-user'
import { useUsers } from '@/features/users/hooks/use-users'
import { RoleBadge } from '@/features/users/components/role-badge'
import { UserStatusBadge } from '@/features/users/components/user-status-badge'
import { USER_ROLE_VALUES, UserRoles } from '@keimelion/api/shared/enums/user-role'
import { cn } from '@/lib/utils'

const EMPTY_LABEL = 'No users match these filters.'

const ROLE_OPTIONS = USER_ROLE_VALUES.map((role) => ({
  value: role,
  label: roleLabelFromValue(role),
}))

const USERS_FILTERS: FilterDefinition[] = [
  {
    type: 'text',
    paramName: 'email',
    label: 'Email',
    placeholder: 'Filter by email…',
  },
  {
    type: 'text',
    paramName: 'username',
    label: 'Username',
    placeholder: 'Filter by username…',
  },
  {
    type: 'select',
    paramName: 'role',
    label: 'Role',
    placeholder: 'All roles',
    options: ROLE_OPTIONS,
  },
]

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
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled
          title="Update — coming soon"
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Update user</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          disabled
          title="Delete — coming soon"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete user</span>
        </Button>
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
    <div>
      <DataTableFilters filters={USERS_FILTERS} />
      <DataTable
        columns={USERS_COLUMNS}
        data={data}
        isLoading={usersQuery.isLoading}
        error={usersQuery.error}
        emptyLabel={EMPTY_LABEL}
        pageSize={filters.limit}
        onRetry={() => { void usersQuery.refetch() }}
        getRowClassName={resolveRowClassName}
      />
      <DataTablePagination
        page={filters.page}
        pageSize={filters.limit}
        total={total}
      />
    </div>
  )
}

function resolveAvatarInitial(user: AdminApiUser): string {
  const source = user.username ?? user.email
  return source.charAt(0).toUpperCase()
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function resolveRowClassName(user: AdminApiUser): string | undefined {
  if (user.deletedAt !== null) {
    return cn('opacity-50')
  }
  return undefined
}

function roleLabelFromValue(role: string): string {
  switch (role) {
    case UserRoles.ADMIN:
      return 'Admin'
    case UserRoles.MODERATOR:
      return 'Moderator'
    case UserRoles.USER:
      return 'User'
    default:
      return role
  }
}
