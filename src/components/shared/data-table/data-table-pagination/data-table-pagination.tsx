'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUrlParams } from '@/components/shared/use-url-params'
import { useTranslate } from '@/lib/i18n/use-translate'

interface DataTablePaginationProps {
  page: number
  pageSize: number
  total: number
}

export function DataTablePagination({ page, pageSize, total }: DataTablePaginationProps): React.JSX.Element {
  const { setPage } = useUrlParams()
  const t = useTranslate()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const isFirstPage = page <= 1
  const isLastPage = page >= totalPages

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span className="font-medium text-foreground">
        {t('common.pagination.page_of', { page, totalPages })}
      </span>
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
  )
}
