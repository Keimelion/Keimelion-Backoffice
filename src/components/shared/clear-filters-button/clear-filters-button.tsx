'use client'

import { X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface ClearFiltersButtonProps {
  paramNames: string[]
}

const PAGINATION_PARAM = 'page'

export function ClearFiltersButton({ paramNames }: ClearFiltersButtonProps): React.JSX.Element | null {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasActive = paramNames.some((name) => searchParams.has(name))

  if (!hasActive) return null

  const handleClick = (): void => {
    const next = new URLSearchParams(searchParams.toString())
    for (const name of paramNames) {
      next.delete(name)
    }
    next.delete(PAGINATION_PARAM)
    router.replace(`?${next.toString()}`, { scroll: false })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-1 px-2 text-muted-foreground hover:text-foreground"
      onClick={handleClick}
    >
      <X className="h-3.5 w-3.5" />
      Clear
    </Button>
  )
}
