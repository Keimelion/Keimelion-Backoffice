'use client'

import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface TextFilterDefinition {
  type: 'text'
  paramName: string
  label: string
  placeholder: string
}

export interface SelectOption {
  value: string
  label: string
}

export interface SelectFilterDefinition {
  type: 'select'
  paramName: string
  label: string
  placeholder: string
  options: SelectOption[]
}

export type FilterDefinition = TextFilterDefinition | SelectFilterDefinition

interface DataTableFiltersProps {
  filters: FilterDefinition[]
}

const DEBOUNCE_DELAY_MS = 300
const PAGINATION_PARAM = 'page'
const ALL_VALUE = '__all__'

export function DataTableFilters({ filters }: DataTableFiltersProps): React.JSX.Element {
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) =>
        filter.type === 'text' ? (
          <TextFilter
            key={filter.paramName}
            definition={filter}
            initialValue={searchParams.get(filter.paramName) ?? ''}
            searchParams={searchParams}
            router={router}
          />
        ) : (
          <SelectFilter
            key={filter.paramName}
            definition={filter}
            initialValue={searchParams.get(filter.paramName) ?? ''}
            searchParams={searchParams}
            router={router}
          />
        ),
      )}
    </div>
  )
}

interface TextFilterProps {
  definition: TextFilterDefinition
  initialValue: string
  searchParams: URLSearchParams
  router: ReturnType<typeof useRouter>
}

function TextFilter({ definition, initialValue, searchParams, router }: TextFilterProps): React.JSX.Element {
  const [value, setValue] = useState(initialValue)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setValue(searchParams.get(definition.paramName) ?? '')
  }, [searchParams, definition.paramName])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const next = event.target.value
    setValue(next)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (next) {
        params.set(definition.paramName, next)
      } else {
        params.delete(definition.paramName)
      }
      params.delete(PAGINATION_PARAM)
      router.replace(`?${params.toString()}`, { scroll: false })
    }, DEBOUNCE_DELAY_MS)
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={definition.paramName}
        aria-label={definition.label}
        placeholder={definition.placeholder}
        value={value}
        onChange={handleChange}
        className="h-8 w-56 pl-8 text-sm"
      />
    </div>
  )
}

interface SelectFilterProps {
  definition: SelectFilterDefinition
  initialValue: string
  searchParams: URLSearchParams
  router: ReturnType<typeof useRouter>
}

function SelectFilter({ definition, initialValue, searchParams, router }: SelectFilterProps): React.JSX.Element {
  const handleValueChange = (selected: string): void => {
    const params = new URLSearchParams(searchParams.toString())
    if (selected === ALL_VALUE) {
      params.delete(definition.paramName)
    } else {
      params.set(definition.paramName, selected)
    }
    params.delete(PAGINATION_PARAM)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <Select value={initialValue || ALL_VALUE} onValueChange={handleValueChange}>
      <SelectTrigger
        id={`select-${definition.paramName}`}
        aria-label={definition.label}
        className="h-8 w-40 text-sm"
      >
        <SelectValue placeholder={definition.placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>{definition.placeholder}</SelectItem>
        {definition.options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
