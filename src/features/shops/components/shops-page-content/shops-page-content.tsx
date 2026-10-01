'use client'

import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ClearFiltersButton,
  DataTable,
  DataTableFilters,
  DataTablePagination,
  ReorderBanner,
  ReorderButton,
  useReorderMode,
} from '@/components/shared/data-table'
import type { DataTableColumn, FilterDefinition } from '@/components/shared/data-table'
import { IconButton } from '@/components/shared/icon-button'
import { useListSearchParams } from '@/components/shared/use-list-search-params'
import { isAdmin } from '@/data-access/_shared/auth-storage'
import { listShopsQuerySchema, type AdminShop } from '@/data-access/shops/admin-shops.schemas'
import { useAdminShops, useReorderShops } from '@/features/shops/hooks/use-admin-shops'
import { useCurrentUserRole } from '@/features/auth/hooks/use-current-user-role'
import { CreateShopDialog } from '@/features/shops/components/create-shop-dialog'
import { EditShopDialog } from '@/features/shops/components/edit-shop-dialog'
import { DeleteShopDialog } from '@/features/shops/components/delete-shop-dialog'
import { IsAffiliatedBadge } from '@/features/shops/components/is-affiliated-badge'
import { formatDate } from '@/lib/format-date'
import { useTranslate } from '@/lib/i18n/use-translate'

const SEARCH_PARAM = 'search'
const IS_ACTIVE_PARAM = 'isActive'
const IS_AFFILIATED_PARAM = 'isAffiliated'
const SORT_PARAM = 'sort'
const HTTPS_PREFIX = 'https://'

const CLEARABLE_PARAMS = [
  SEARCH_PARAM,
  IS_ACTIVE_PARAM,
  IS_AFFILIATED_PARAM,
  SORT_PARAM,
]

function resolveLogoUrl(shop: AdminShop): string | null {
  if (typeof shop.logoUrl === 'string' && shop.logoUrl.startsWith(HTTPS_PREFIX)) {
    return shop.logoUrl
  }
  return null
}

function resolveRowClassName(shop: AdminShop): string | undefined {
  if (!shop.isActive) return 'opacity-50'
  return undefined
}

export function ShopsPageContent(): React.JSX.Element {
  const t = useTranslate()
  const { isReorderMode, enterReorderMode, exitReorderMode } = useReorderMode()
  const filters = useListSearchParams(listShopsQuerySchema)
  const currentRole = useCurrentUserRole()
  const isCurrentUserAdmin = currentRole !== null && isAdmin(currentRole)
  const showActions = isCurrentUserAdmin && !isReorderMode

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false)
  const [editTarget, setEditTarget] = useState<AdminShop | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminShop | null>(null)

  const shopsQuery = useAdminShops(filters)
  const shops = shopsQuery.data?.items ?? []
  const total = shopsQuery.data?.pagination.total ?? 0
  const reorderMutation = useReorderShops(filters)

  const shopsFilters: FilterDefinition[] = [
    {
      type: 'text',
      paramName: SEARCH_PARAM,
      label: t('shops.filters.search_label'),
      placeholder: t('shops.filters.search_placeholder'),
    },
    {
      type: 'select',
      paramName: IS_ACTIVE_PARAM,
      label: t('shops.filters.is_active_label'),
      placeholder: t('shops.filters.all_option'),
      options: [
        { value: 'true', label: t('shops.admin.badge.active') },
        { value: 'false', label: t('shops.admin.badge.inactive') },
      ],
    },
    {
      type: 'select',
      paramName: IS_AFFILIATED_PARAM,
      label: t('shops.filters.is_affiliated_label'),
      placeholder: t('shops.filters.all_option'),
      options: [
        { value: 'true', label: t('shops.admin.badge.affiliated') },
        { value: 'false', label: t('shops.admin.badge.not_affiliated') },
      ],
    },
  ]

  const columns: DataTableColumn<AdminShop>[] = [
    {
      key: 'logo',
      header: '',
      className: 'w-12',
      cell: (shop) => {
        const safeLogoUrl = resolveLogoUrl(shop)
        return (
          <Avatar className="h-8 w-8">
            {safeLogoUrl !== null ? (
              <AvatarImage
                src={safeLogoUrl}
                alt={shop.name}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : null}
            <AvatarFallback className="text-xs">{shop.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        )
      },
    },
    {
      key: 'name',
      header: t('shops.table.column.name'),
      sortable: true,
      cell: (shop) => <span className="font-medium">{shop.name}</span>,
    },
    {
      key: 'slug',
      header: t('shops.table.column.slug'),
      sortable: true,
      cell: (shop) => <span className="font-mono text-sm text-muted-foreground">{shop.slug}</span>,
    },
    {
      key: 'domain',
      header: t('shops.table.column.domain'),
      cell: (shop) => <span className="text-sm text-muted-foreground">{shop.domain ?? '—'}</span>,
    },
    {
      key: 'isAffiliated',
      header: t('shops.table.column.is_affiliated'),
      className: 'w-40 whitespace-nowrap',
      cell: (shop) => <IsAffiliatedBadge isAffiliated={shop.isAffiliated} />,
    },
    {
      key: 'isActive',
      header: t('shops.table.column.is_active'),
      className: 'w-24',
      cell: (shop) =>
        shop.isActive ? (
          <Badge variant="default">{t('shops.admin.badge.active')}</Badge>
        ) : (
          <Badge variant="secondary">{t('shops.admin.badge.inactive')}</Badge>
        ),
    },
    {
      key: 'createdAt',
      header: t('shops.table.column.created_at'),
      sortable: true,
      cell: (shop) => formatDate(shop.createdAt),
    },
    ...(showActions
      ? [
          {
            key: 'actions',
            header: t('shops.table.column.actions'),
            className: 'w-28 text-right',
            cell: (shop: AdminShop) => (
              <div className="flex justify-end gap-1">
                <IconButton
                  label={t('common.actions.update', { name: shop.name })}
                  onClick={() => { setEditTarget(shop) }}
                >
                  <Pencil />
                </IconButton>
                <IconButton
                  label={t('common.actions.delete', { name: shop.name })}
                  tone="destructive"
                  onClick={() => { setDeleteTarget(shop) }}
                >
                  <Trash2 />
                </IconButton>
              </div>
            ),
          } satisfies DataTableColumn<AdminShop>,
        ]
      : []),
  ]

  const toolbar = isReorderMode ? (
    <ReorderBanner onExit={exitReorderMode} />
  ) : (
    <div className="flex flex-wrap items-end gap-3">
      <DataTableFilters filters={shopsFilters} />
      <ClearFiltersButton paramNames={CLEARABLE_PARAMS} />
      {isCurrentUserAdmin ? (
        <div className="ml-auto flex items-center gap-2">
          <ReorderButton onClick={enterReorderMode} />
          <Button size="sm" onClick={() => { setIsCreateOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            {t('shops.admin.create_button')}
          </Button>
        </div>
      ) : null}
    </div>
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={shops}
        isLoading={shopsQuery.isLoading}
        error={shopsQuery.error}
        emptyLabel={t('shops.table.empty')}
        skeletonRowCount={filters.limit}
        onRetry={() => { void shopsQuery.refetch() }}
        getRowClassName={resolveRowClassName}
        getRowLabel={(shop) => shop.name}
        isReorderMode={isReorderMode && isCurrentUserAdmin}
        onReorder={(nextItems) => {
          reorderMutation.mutate({ previousItems: shops, nextItems })
        }}
        toolbar={toolbar}
        footer={
          <DataTablePagination page={filters.page} pageSize={filters.limit} total={total} />
        }
      />

      {isCurrentUserAdmin ? (
        <CreateShopDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      ) : null}

      {editTarget !== null ? (
        <EditShopDialog
          open
          onOpenChange={(open) => {
            if (!open) setEditTarget(null)
          }}
          shop={editTarget}
        />
      ) : null}

      {deleteTarget !== null ? (
        <DeleteShopDialog
          open
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null)
          }}
          shop={deleteTarget}
        />
      ) : null}
    </>
  )
}
