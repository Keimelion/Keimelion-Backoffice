'use client'

import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  ClearFiltersButton,
  DataTable,
  DataTableFilters,
  DataTablePagination,
} from '@/components/shared/data-table'
import type { DataTableColumn, FilterDefinition } from '@/components/shared/data-table'
import { IconButton } from '@/components/shared/icon-button'
import { useListSearchParams } from '@/components/shared/use-list-search-params'
import { getStoredUser } from '@/data-access/_shared/auth-storage'
import { listUsersQuerySchema, type AdminApiUser } from '@/data-access/users/list-users'
import { formatDate } from '@/lib/format-date'
import { useTranslate } from '@/lib/i18n/use-translate'
import { useUsers } from '@/features/users/hooks/use-users'
import { useCurrentUserRole } from '@/features/auth/hooks/use-current-user-role'
import { RoleBadge } from '@/features/users/components/role-badge'
import { ROLE_PARAM, RoleFilter } from '@/features/users/components/role-filter'
import { UserStatusBadge } from '@/features/users/components/user-status-badge'
import { CreateUserDialog } from '@/features/users/components/create-user-dialog'
import { EditUserDialog } from '@/features/users/components/edit-user-dialog'
import { DeleteUserDialog } from '@/features/users/components/delete-user-dialog'

export function UsersPageContent(): React.JSX.Element {
  const t = useTranslate()
  const filters = useListSearchParams(listUsersQuerySchema)
  const currentRole = useCurrentUserRole()
  const isAdmin = currentRole === 'admin'
  const currentUserId = getStoredUser()?.id ?? null

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false)
  const [editTarget, setEditTarget] = useState<AdminApiUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminApiUser | null>(null)

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

  const emptyLabel = t('users.table.empty')

  const usersFilters: FilterDefinition[] = [
    {
      type: 'text',
      paramName: 'email',
      label: t('users.filters.email_label'),
      placeholder: t('users.filters.email_placeholder'),
    },
    {
      type: 'text',
      paramName: 'username',
      label: t('users.filters.username_label'),
      placeholder: t('users.filters.username_placeholder'),
    },
  ]

  const usersColumns: DataTableColumn<AdminApiUser>[] = [
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
      header: t('users.table.column.email'),
      sortable: true,
      cell: (user) => <span className="font-medium">{user.email}</span>,
    },
    {
      key: 'username',
      header: t('users.table.column.username'),
      sortable: true,
      cell: (user) => (
        <span className="text-muted-foreground">{user.username ?? '—'}</span>
      ),
    },
    {
      key: 'role',
      header: t('users.table.column.role'),
      cell: (user) => <RoleBadge role={user.role} />,
    },
    {
      key: 'createdAt',
      header: t('users.table.column.created'),
      sortable: true,
      cell: (user) => formatDate(user.createdAt),
    },
    {
      key: 'lastActiveAt',
      header: t('users.table.column.last_active'),
      sortable: true,
      cell: (user) => (user.lastActiveAt !== null ? formatDate(user.lastActiveAt) : '—'),
    },
    {
      key: 'status',
      header: t('users.table.column.status'),
      cell: (user) => (
        <UserStatusBadge deletedAt={user.deletedAt} bannedAt={user.bannedAt} />
      ),
    },
    ...(isAdmin
      ? [
          {
            key: 'actions',
            header: t('users.table.column.actions'),
            className: 'w-28 text-right',
            cell: (user: AdminApiUser) => {
              const identifier = user.username ?? user.email
              const isSelf = user.id === currentUserId
              return (
                <div className="flex justify-end gap-1">
                  <IconButton
                    label={
                      isSelf
                        ? t('users.actions.edit_own_tooltip')
                        : t('common.actions.update', { name: identifier })
                    }
                    disabled={isSelf}
                    onClick={() => { setEditTarget(user) }}
                  >
                    <Pencil />
                  </IconButton>
                  <IconButton
                    label={
                      isSelf
                        ? t('users.actions.delete_own_tooltip')
                        : t('common.actions.delete', { name: identifier })
                    }
                    tone="destructive"
                    disabled={isSelf}
                    onClick={() => { setDeleteTarget(user) }}
                  >
                    <Trash2 />
                  </IconButton>
                </div>
              )
            },
          } satisfies DataTableColumn<AdminApiUser>,
        ]
      : []),
  ]

  const usersClearableParams = [...usersFilters.map((filter) => filter.paramName), ROLE_PARAM]

  return (
    <>
      <DataTable
        columns={usersColumns}
        data={data}
        isLoading={usersQuery.isLoading}
        error={usersQuery.error}
        emptyLabel={emptyLabel}
        skeletonRowCount={filters.limit}
        onRetry={() => { void usersQuery.refetch() }}
        getRowClassName={resolveRowClassName}
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <DataTableFilters filters={usersFilters} />
            <div className="h-6 w-px bg-border" />
            <RoleFilter />
            <ClearFiltersButton paramNames={usersClearableParams} />
            {isAdmin ? (
              <div className="ml-auto">
                <Button size="sm" onClick={() => { setIsCreateOpen(true) }}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('users.actions.create_button')}
                </Button>
              </div>
            ) : null}
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

      {isAdmin ? (
        <CreateUserDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
        />
      ) : null}

      {editTarget !== null ? (
        <EditUserDialog
          open
          onOpenChange={(open) => {
            if (!open) setEditTarget(null)
          }}
          user={editTarget}
        />
      ) : null}

      {deleteTarget !== null ? (
        <DeleteUserDialog
          open
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null)
          }}
          user={deleteTarget}
        />
      ) : null}
    </>
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
