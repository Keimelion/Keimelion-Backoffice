'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { XCircle } from 'lucide-react'
import {
  ClearFiltersButton,
  DataTable,
  DataTableFilters,
  DataTablePagination,
} from '@/components/shared/data-table'
import type { DataTableColumn, FilterDefinition } from '@/components/shared/data-table'
import { IconButton } from '@/components/shared/icon-button'
import { UserRefCell } from '@/components/shared/user-ref-cell'
import { useListSearchParams } from '@/components/shared/use-list-search-params'
import {
  listAdminReservationsQuerySchema,
  type ApiAdminReservation,
} from '@/data-access/reservations/reservations.schemas'
import { useAdminReservations } from '@/features/reservations/hooks/use-admin-reservations'
import { CancelReservationDialog } from '@/features/reservations/components/cancel-reservation-dialog'
import { ImageThumbnail } from '@/components/shared/image-thumbnail'
import { formatDate } from '@/lib/format-date'
import { useTranslate } from '@/lib/i18n/use-translate'
import type { TranslateFn } from '@/lib/i18n/use-translate'

const USER_ID_PARAM = 'userId'
const LIST_ID_PARAM = 'listId'
const ITEM_ID_PARAM = 'itemId'
const SORT_PARAM = 'sort'

const CLEARABLE_PARAMS = [USER_ID_PARAM, LIST_ID_PARAM, ITEM_ID_PARAM, SORT_PARAM]

export function ReservationsList(): React.JSX.Element {
  const t = useTranslate()
  const filters = useListSearchParams(listAdminReservationsQuerySchema)

  const [cancelTarget, setCancelTarget] = useState<ApiAdminReservation | null>(null)

  const reservationsQuery = useAdminReservations(filters)
  const items = reservationsQuery.data?.items ?? []
  const total = reservationsQuery.data?.pagination.total ?? 0

  const filtersDefinition = useMemo<FilterDefinition[]>(
    () => [
      {
        type: 'text',
        paramName: USER_ID_PARAM,
        label: t('reservations.filters.user_label'),
        placeholder: t('reservations.filters.user_placeholder'),
      },
      {
        type: 'text',
        paramName: LIST_ID_PARAM,
        label: t('reservations.filters.list_label'),
        placeholder: t('reservations.filters.list_placeholder'),
      },
      {
        type: 'text',
        paramName: ITEM_ID_PARAM,
        label: t('reservations.filters.item_label'),
        placeholder: t('reservations.filters.item_placeholder'),
      },
    ],
    [t],
  )

  const columns = useMemo<DataTableColumn<ApiAdminReservation>[]>(
    () => buildColumns(t, (reservation) => { setCancelTarget(reservation) }),
    [t],
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={items}
        isLoading={reservationsQuery.isLoading}
        error={reservationsQuery.error}
        emptyLabel={t('reservations.table.empty')}
        skeletonRowCount={filters.limit}
        onRetry={() => { void reservationsQuery.refetch() }}
        getRowLabel={(reservation) => reservation.listItem.name}
        toolbar={
          <div className="flex flex-wrap items-end gap-3">
            <DataTableFilters filters={filtersDefinition} />
            <ClearFiltersButton paramNames={CLEARABLE_PARAMS} />
          </div>
        }
        footer={
          <DataTablePagination page={filters.page} pageSize={filters.limit} total={total} />
        }
      />

      {cancelTarget !== null ? (
        <CancelReservationDialog
          open
          onOpenChange={(open) => {
            if (!open) setCancelTarget(null)
          }}
          reservation={cancelTarget}
          onCancelled={() => { setCancelTarget(null) }}
        />
      ) : null}
    </>
  )
}

const LINK_CLASS = 'text-sm font-medium hover:underline'

function buildColumns(
  t: TranslateFn,
  onCancel: (reservation: ApiAdminReservation) => void,
): DataTableColumn<ApiAdminReservation>[] {
  return [
    {
      key: 'reserver',
      header: t('reservations.table.column.reserver'),
      cell: (reservation) => <UserRefCell user={reservation.user} />,
    },
    {
      key: 'item',
      header: t('reservations.table.column.item'),
      cell: (reservation) => (
        <div className="flex items-center gap-2">
          <ImageThumbnail
            src={reservation.listItem.image?.urls.sm ?? null}
            fullSrc={reservation.listItem.image?.urls.lg ?? null}
            alt={reservation.listItem.name}
          />
          <Link href={`/items?id=${reservation.listItem.itemId}`} className={LINK_CLASS}>
            {reservation.listItem.name}
          </Link>
        </div>
      ),
    },
    {
      key: 'list',
      header: t('reservations.table.column.list'),
      cell: (reservation) => (
        <div className="flex flex-col gap-0.5">
          <Link href={`/lists?id=${reservation.list.id}`} className="text-sm hover:underline">
            {reservation.list.title}
          </Link>
          <span className="text-xs text-muted-foreground">
            {reservation.list.slug}
            {' · '}
            {resolveOwnerLabel(reservation, t)}
          </span>
        </div>
      ),
    },
    {
      key: 'quantityBooked',
      header: t('reservations.table.column.quantity'),
      sortable: true,
      className: 'w-24',
      cell: (reservation) => (
        <span className="text-sm">{reservation.quantityBooked}</span>
      ),
    },
    {
      key: 'createdAt',
      header: t('reservations.table.column.created_at'),
      sortable: true,
      className: 'w-28',
      cell: (reservation) => formatDate(reservation.createdAt),
    },
    {
      key: 'actions',
      header: t('reservations.table.column.actions'),
      className: 'w-20 text-right',
      cell: (reservation) => (
        <div className="flex justify-end">
          <IconButton
            label={t('reservations.actions.cancel')}
            tone="destructive"
            onClick={() => { onCancel(reservation) }}
          >
            <XCircle />
          </IconButton>
        </div>
      ),
    },
  ]
}

function resolveOwnerLabel(reservation: ApiAdminReservation, t: TranslateFn): string {
  if (reservation.list.owner === null) return t('reservations.table.list_owner_none')
  const owner = reservation.list.owner.username ?? reservation.list.owner.email
  return t('reservations.table.list_owner', { owner })
}
