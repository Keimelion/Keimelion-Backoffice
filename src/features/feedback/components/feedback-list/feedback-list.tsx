'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ClearFiltersButton,
  DataTable,
  DataTableFilters,
  DataTablePagination,
} from '@/components/shared/data-table'
import type { DataTableColumn, FilterDefinition } from '@/components/shared/data-table'
import { useListSearchParams } from '@/components/shared/use-list-search-params'
import { UserRefCell } from '@/components/shared/user-ref-cell'
import {
  listFeedbackQuerySchema,
  type ApiAdminFeedback,
} from '@/data-access/feedback/feedback.schemas'
import { useAdminFeedback } from '@/features/feedback/hooks/use-admin-feedback'
import { FeedbackDetailsRow } from '@/features/feedback/components/feedback-details-row'
import { FeedbackStatusActions } from '@/features/feedback/components/feedback-status-actions'
import { FeedbackStatusBadge } from '@/features/feedback/components/feedback-status-badge'
import {
  STATUS_PARAM,
  FeedbackStatusFilter,
} from '@/features/feedback/components/feedback-status-filter'
import {
  CREATED_FROM_PARAM,
  CREATED_TO_PARAM,
  FeedbackDateRangeFilter,
} from '@/features/feedback/components/feedback-date-range-filter'
import { formatDate } from '@/lib/format-date'
import { useTranslate } from '@/lib/i18n/use-translate'
import type { TranslateFn } from '@/lib/i18n/use-translate'

const TITLE_PARAM = 'title'
const USER_ID_PARAM = 'userId'
const SORT_PARAM = 'sort'
const DESCRIPTION_PREVIEW_LENGTH = 120

const CLEARABLE_PARAMS = [
  TITLE_PARAM,
  USER_ID_PARAM,
  STATUS_PARAM,
  CREATED_FROM_PARAM,
  CREATED_TO_PARAM,
  SORT_PARAM,
]

function truncatePreview(description: string): string {
  if (description.length <= DESCRIPTION_PREVIEW_LENGTH) return description
  return `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH)}…`
}

function buildColumns(t: TranslateFn): DataTableColumn<ApiAdminFeedback>[] {
  return [
    {
      key: 'title',
      header: t('feedback.table.column.title'),
      cell: (feedback) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{feedback.title}</span>
          <span className="font-mono text-[10px] text-muted-foreground">{feedback.id}</span>
        </div>
      ),
    },
    {
      key: 'description',
      header: t('feedback.table.column.description'),
      cell: (feedback) => (
        <span className="line-clamp-2 text-xs text-muted-foreground">
          {truncatePreview(feedback.description)}
        </span>
      ),
    },
    {
      key: 'user',
      header: t('feedback.table.column.user'),
      cell: (feedback) => (
        <UserRefCell user={feedback.user} fallback={t('feedback.table.user_none')} />
      ),
    },
    {
      key: 'status',
      header: t('feedback.table.column.status'),
      sortable: true,
      className: 'w-28',
      cell: (feedback) => <FeedbackStatusBadge status={feedback.status} />,
    },
    {
      key: 'createdAt',
      header: t('feedback.table.column.created_at'),
      sortable: true,
      className: 'w-28',
      cell: (feedback) => formatDate(feedback.createdAt),
    },
    {
      key: 'actions',
      header: t('feedback.table.column.actions'),
      className: 'w-24 text-right',
      cell: (feedback) => <FeedbackStatusActions feedback={feedback} />,
    },
  ]
}

export function FeedbackList(): React.JSX.Element {
  const t = useTranslate()
  const filters = useListSearchParams(listFeedbackQuerySchema)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())

  const feedbackQuery = useAdminFeedback(filters)
  const items = feedbackQuery.data?.items ?? []
  const total = feedbackQuery.data?.pagination.total ?? 0

  const visibleIds = useMemo(() => new Set(items.map((item) => item.id)), [items])

  useEffect(() => {
    setExpandedIds((previous) => {
      let changed = false
      const next = new Set<string>()
      for (const id of previous) {
        if (visibleIds.has(id)) {
          next.add(id)
          continue
        }
        changed = true
      }
      return changed ? next : previous
    })
  }, [visibleIds])

  function toggleExpanded(feedbackId: string): void {
    setExpandedIds((previous) => {
      const next = new Set(previous)
      if (next.has(feedbackId)) {
        next.delete(feedbackId)
        return next
      }
      next.add(feedbackId)
      return next
    })
  }

  const filtersDefinition = useMemo<FilterDefinition[]>(
    () => [
      {
        type: 'text',
        paramName: TITLE_PARAM,
        label: t('feedback.filters.title_label'),
        placeholder: t('feedback.filters.title_placeholder'),
      },
      {
        type: 'text',
        paramName: USER_ID_PARAM,
        label: t('feedback.filters.user_label'),
        placeholder: t('feedback.filters.user_placeholder'),
      },
    ],
    [t],
  )

  const columns = useMemo<DataTableColumn<ApiAdminFeedback>[]>(() => buildColumns(t), [t])

  const renderExpandedRow = useMemo(
    () => (feedback: ApiAdminFeedback) => <FeedbackDetailsRow feedback={feedback} />,
    [],
  )

  const isRowExpanded = useMemo(
    () => (feedback: ApiAdminFeedback) => expandedIds.has(feedback.id),
    [expandedIds],
  )

  return (
    <DataTable
      columns={columns}
      data={items}
      isLoading={feedbackQuery.isLoading}
      error={feedbackQuery.error}
      emptyLabel={t('feedback.table.empty')}
      skeletonRowCount={filters.limit}
      onRetry={() => { void feedbackQuery.refetch() }}
      getRowLabel={(feedback) => feedback.title}
      renderExpandedRow={renderExpandedRow}
      isRowExpanded={isRowExpanded}
      onRowClick={(feedback) => { toggleExpanded(feedback.id) }}
      toolbar={
        <div className="flex flex-wrap items-end gap-3">
          <DataTableFilters filters={filtersDefinition} />
          <FeedbackDateRangeFilter />
          <div className="mb-1.5 h-6 w-px self-end bg-border" />
          <FeedbackStatusFilter />
          <ClearFiltersButton paramNames={CLEARABLE_PARAMS} />
        </div>
      }
      footer={
        <DataTablePagination page={filters.page} pageSize={filters.limit} total={total} />
      }
    />
  )
}
