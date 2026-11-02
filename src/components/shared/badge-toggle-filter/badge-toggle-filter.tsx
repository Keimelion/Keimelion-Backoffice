'use client'

import type { ReactNode } from 'react'
import { useUrlParams } from '@/components/shared/use-url-params'

interface BadgeToggleFilterProps<V extends string> {
  paramName: string
  label: string
  values: readonly V[]
  renderBadge: (value: V) => ReactNode
}

export function BadgeToggleFilter<V extends string>({
  paramName,
  label,
  values,
  renderBadge,
}: BadgeToggleFilterProps<V>): React.JSX.Element {
  const { searchParams, setFilterParam } = useUrlParams()
  const activeValue = searchParams.get(paramName)
  const hasActiveValue = activeValue !== null

  const handleToggle = (value: V): void => {
    setFilterParam(paramName, activeValue === value ? null : value)
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex h-9 items-center gap-1.5">
        {values.map((value) => {
          const isActive = activeValue === value
          const isDimmed = hasActiveValue && !isActive
          return (
            <button
              key={value}
              type="button"
              aria-pressed={isActive}
              onClick={() => { handleToggle(value) }}
              className={`cursor-pointer rounded-full transition-opacity hover:opacity-80 ${isDimmed ? 'opacity-40' : ''}`}
            >
              {renderBadge(value)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
