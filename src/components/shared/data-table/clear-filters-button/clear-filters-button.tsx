'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUrlParams } from '@/components/shared/use-url-params'

interface ClearFiltersButtonProps {
  paramNames: string[]
}

export function ClearFiltersButton({ paramNames }: ClearFiltersButtonProps): React.JSX.Element | null {
  const { searchParams, clearParams } = useUrlParams()
  const hasActive = paramNames.some((name) => searchParams.has(name))

  if (!hasActive) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-1 px-2 text-muted-foreground hover:text-foreground"
      onClick={() => { clearParams(paramNames) }}
    >
      <X className="h-3.5 w-3.5" />
      Clear
    </Button>
  )
}
