'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface DataTablePaginationProps {
  page: number
  pageSize: number
  total: number
}

const PAGINATION_PARAM = 'page'

export function DataTablePagination({ page, pageSize, total }: DataTablePaginationProps): React.JSX.Element {
  const router = useRouter()
  const searchParams = useSearchParams()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const isFirstPage = page <= 1
  const isLastPage = page >= totalPages

  const navigateToPage = (targetPage: number): void => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(PAGINATION_PARAM, String(targetPage))
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isFirstPage}
          onClick={() => {
            navigateToPage(page - 1)
          }}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isLastPage}
          onClick={() => {
            navigateToPage(page + 1)
          }}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
