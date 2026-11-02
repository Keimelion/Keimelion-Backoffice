'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUrlParams } from '@/components/shared/use-url-params'
import { useTranslate } from '@/lib/i18n/use-translate'

interface DataTablePaginationProps {
  page: number
  pageSize: number
  total: number
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

export function DataTablePagination({ page, pageSize, total }: DataTablePaginationProps): React.JSX.Element {
  const { setPage, setPageSize } = useUrlParams()
  const t = useTranslate()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const isFirstPage = page <= 1
  const isLastPage = page >= totalPages

  const handlePageSizeChange = (value: string): void => {
    const nextSize = Number(value)
    if (!Number.isFinite(nextSize)) return
    setPageSize(nextSize)
  }

  return (
    <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span className="font-medium text-foreground">
          {t('common.pagination.page_of', { page, totalPages })}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="data-table-page-size" className="text-xs uppercase tracking-wide">
            {t('common.pagination.rows_per_page')}
          </label>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger id="data-table-page-size" className="h-8 w-20 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isFirstPage}
            onClick={() => { setPage(page - 1) }}
          >
            <ChevronLeft className="h-4 w-4" />
            {t('common.pagination.previous')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isLastPage}
            onClick={() => { setPage(page + 1) }}
          >
            {t('common.pagination.next')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
