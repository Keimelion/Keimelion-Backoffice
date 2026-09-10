'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUrlParams } from '@/components/shared/use-url-params'

interface DataTablePaginationProps {
  page: number
  pageSize: number
  total: number
}

export function DataTablePagination({ page, pageSize, total }: DataTablePaginationProps): React.JSX.Element {
  const { setPage } = useUrlParams()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const isFirstPage = page <= 1
  const isLastPage = page >= totalPages

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span className="font-medium text-foreground">
        Page {page} / {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isFirstPage}
          onClick={() => { setPage(page - 1) }}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isLastPage}
          onClick={() => { setPage(page + 1) }}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
