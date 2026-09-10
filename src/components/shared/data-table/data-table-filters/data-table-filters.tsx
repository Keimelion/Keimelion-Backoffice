'use client'

import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUrlParams } from '@/components/shared/use-url-params'

interface TextFilterDefinition {
  type: 'text'
  paramName: string
  label: string
  placeholder: string
}

interface SelectOption {
  value: string
  label: string
}

interface SelectFilterDefinition {
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
const ALL_VALUE = '__all__'

export function DataTableFilters({ filters }: DataTableFiltersProps): React.JSX.Element {
  const { searchParams } = useUrlParams()

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) =>
        filter.type === 'text' ? (
          <TextFilter
            key={filter.paramName}
            definition={filter}
            currentValue={searchParams.get(filter.paramName) ?? ''}
          />
        ) : (
          <SelectFilter
            key={filter.paramName}
            definition={filter}
            currentValue={searchParams.get(filter.paramName) ?? ''}
          />
        ),
      )}
    </div>
  )
}

interface TextFilterProps {
  definition: TextFilterDefinition
  currentValue: string
}

function TextFilter({ definition, currentValue }: TextFilterProps): React.JSX.Element {
  const { setFilterParam } = useUrlParams()
  const [value, setValue] = useState(currentValue)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setValue(currentValue)
  }, [currentValue])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const next = event.target.value
    setValue(next)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setFilterParam(definition.paramName, next)
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
  currentValue: string
}

function SelectFilter({ definition, currentValue }: SelectFilterProps): React.JSX.Element {
  const { setFilterParam } = useUrlParams()

  const handleValueChange = (selected: string): void => {
    setFilterParam(definition.paramName, selected === ALL_VALUE ? null : selected)
  }

  return (
    <Select value={currentValue || ALL_VALUE} onValueChange={handleValueChange}>
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
