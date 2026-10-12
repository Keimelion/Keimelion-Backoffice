'use client'

import { useMemo } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import {
  listCategoriesQuerySchema,
  type ApiCategory,
} from '@/data-access/categories/categories.schemas'
import { useAdminCategories } from '@/features/categories/hooks/use-admin-categories'
import { formatDate } from '@/lib/format-date'
import { useTranslate } from '@/lib/i18n/use-translate'

const SEARCH_PARAM = 'search'
const DEPTH_PARAM = 'depth'
const PARENT_PARAM = 'parentId'
const SORT_PARAM = 'sort'

const CLEARABLE_PARAMS = [SEARCH_PARAM, DEPTH_PARAM, PARENT_PARAM, SORT_PARAM]

const ROOT_CATEGORIES_FILTER = { page: 1, limit: 100, depth: 0 } as const

interface CategoriesListProps {
  categoriesIndex: readonly ApiCategory[]
  onCreateClick: () => void
  onEditClick: (category: ApiCategory) => void
  onDeleteClick: (category: ApiCategory) => void
}

export function CategoriesList({
  categoriesIndex,
  onCreateClick,
  onEditClick,
  onDeleteClick,
}: CategoriesListProps): React.JSX.Element {
  const t = useTranslate()
  const filters = useListSearchParams(listCategoriesQuerySchema)

  const categoriesQuery = useAdminCategories(filters)
  const categories = categoriesQuery.data?.items ?? []
  const total = categoriesQuery.data?.pagination.total ?? 0

  const rootCategoriesQuery = useAdminCategories(ROOT_CATEGORIES_FILTER)
  const rootCategories = rootCategoriesQuery.data?.items ?? []

  const parentNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const category of categoriesIndex) {
      map.set(category.id, category.name)
    }
    return map
  }, [categoriesIndex])

  const categoriesFilters: FilterDefinition[] = [
    {
      type: 'text',
      paramName: SEARCH_PARAM,
      label: t('categories.filters.search_label'),
      placeholder: t('categories.filters.search_placeholder'),
    },
    {
      type: 'select',
      paramName: DEPTH_PARAM,
      label: t('categories.filters.depth_label'),
      placeholder: t('categories.filters.all_option'),
      options: [
        { value: '0', label: t('categories.filters.depth_root') },
        { value: '1', label: t('categories.filters.depth_level_1') },
        { value: '2', label: t('categories.filters.depth_level_2') },
      ],
    },
    {
      type: 'select',
      paramName: PARENT_PARAM,
      label: t('categories.filters.parent_label'),
      placeholder: t('categories.filters.all_option'),
      options: rootCategories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    },
  ]

  const columns: DataTableColumn<ApiCategory>[] = [
    {
      key: 'name',
      header: t('categories.table.column.name'),
      sortable: true,
      cell: (category) => <span className="font-medium">{category.name}</span>,
    },
    {
      key: 'slug',
      header: t('categories.table.column.slug'),
      sortable: true,
      cell: (category) => (
        <span className="font-mono text-sm text-muted-foreground">{category.slug}</span>
      ),
    },
    {
      key: 'parent',
      header: t('categories.table.column.parent'),
      cell: (category) => {
        if (category.parentId === null) {
          return (
            <span className="text-sm text-muted-foreground">
              {t('categories.table.parent_root')}
            </span>
          )
        }
        const parentName = parentNameById.get(category.parentId)
        if (parentName === undefined) return <span className="text-sm text-muted-foreground">—</span>
        return <span className="text-sm">{parentName}</span>
      },
    },
    {
      key: 'depth',
      header: t('categories.table.column.depth'),
      className: 'w-20',
      cell: (category) => <Badge variant="secondary">{category.depth}</Badge>,
    },
    {
      key: 'createdAt',
      header: t('categories.table.column.created_at'),
      sortable: true,
      cell: (category) => formatDate(category.createdAt),
    },
    {
      key: 'updatedAt',
      header: t('categories.table.column.updated_at'),
      sortable: true,
      cell: (category) => formatDate(category.updatedAt),
    },
    {
      key: 'actions',
      header: t('categories.table.column.actions'),
      className: 'w-28 text-right',
      cell: (category) => (
        <div className="flex justify-end gap-1">
          <IconButton
            label={t('common.actions.update', { name: category.name })}
            onClick={() => { onEditClick(category) }}
          >
            <Pencil />
          </IconButton>
          <IconButton
            label={t('common.actions.delete', { name: category.name })}
            tone="destructive"
            onClick={() => { onDeleteClick(category) }}
          >
            <Trash2 />
          </IconButton>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={categories}
      isLoading={categoriesQuery.isLoading}
      error={categoriesQuery.error}
      emptyLabel={t('categories.table.empty')}
      skeletonRowCount={filters.limit}
      onRetry={() => { void categoriesQuery.refetch() }}
      getRowLabel={(category) => category.name}
      toolbar={
        <div className="flex flex-wrap items-end gap-3">
          <DataTableFilters filters={categoriesFilters} />
          <ClearFiltersButton paramNames={CLEARABLE_PARAMS} />
          <div className="ml-auto">
            <Button size="sm" onClick={onCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              {t('categories.admin.create_button')}
            </Button>
          </div>
        </div>
      }
      footer={
        <DataTablePagination page={filters.page} pageSize={filters.limit} total={total} />
      }
    />
  )
}
