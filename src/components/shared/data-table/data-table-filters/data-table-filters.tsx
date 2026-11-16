'use client'

import { ChevronDown, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUrlParams } from '@/components/shared/use-url-params'
import { MULTI_VALUE_SEPARATOR } from '@/lib/url-params'
import { cn } from '@/lib/utils'

interface TextFilterDefinition {
  type: 'text'
  paramName: string
  label: string
  placeholder: string
}

interface SelectOption {
  value: string
  label: string
  icon?: string
}

interface SelectFilterDefinition {
  type: 'select'
  paramName: string
  label: string
  placeholder: string
  options: SelectOption[]
}

interface MultiSelectFilterDefinition {
  type: 'multi-select'
  paramName: string
  label: string
  placeholder: string
  options: SelectOption[]
}

export type FilterDefinition =
  | TextFilterDefinition
  | SelectFilterDefinition
  | MultiSelectFilterDefinition

interface DataTableFiltersProps {
  filters: FilterDefinition[]
}

const DEBOUNCE_DELAY_MS = 300
const ALL_VALUE = '__all__'
const SELECTED_LABELS_SEPARATOR = ', '

export function DataTableFilters({ filters }: DataTableFiltersProps): React.JSX.Element {
  const { searchParams } = useUrlParams()

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <FilterControl
          key={filter.paramName}
          definition={filter}
          currentValue={searchParams.get(filter.paramName) ?? ''}
        />
      ))}
    </div>
  )
}

interface FilterControlProps {
  definition: FilterDefinition
  currentValue: string
}

function FilterControl({ definition, currentValue }: FilterControlProps): React.JSX.Element {
  switch (definition.type) {
    case 'text':
      return <TextFilter definition={definition} currentValue={currentValue} />
    case 'select':
      return <SelectFilter definition={definition} currentValue={currentValue} />
    case 'multi-select':
      return <MultiSelectFilter definition={definition} currentValue={currentValue} />
    default:
      return definition satisfies never
  }
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
    <div className="flex flex-col gap-1">
      <label
        htmlFor={definition.paramName}
        className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
      >
        {definition.label}
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={definition.paramName}
          placeholder={definition.placeholder}
          value={value}
          onChange={handleChange}
          className="h-8 w-56 pl-8 text-sm"
        />
      </div>
    </div>
  )
}

interface SelectFilterProps {
  definition: SelectFilterDefinition
  currentValue: string
}

function SelectFilter({ definition, currentValue }: SelectFilterProps): React.JSX.Element {
  const { setFilterParam } = useUrlParams()
  const selectId = `select-${definition.paramName}`

  const handleValueChange = (selected: string): void => {
    setFilterParam(definition.paramName, selected === ALL_VALUE ? null : selected)
  }

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={selectId}
        className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
      >
        {definition.label}
      </label>
      <Select value={currentValue || ALL_VALUE} onValueChange={handleValueChange}>
        <SelectTrigger id={selectId} className="h-8 w-40 text-sm">
          <SelectValue placeholder={definition.placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>{definition.placeholder}</SelectItem>
          {definition.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.icon !== undefined && option.icon.length > 0 ? (
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="text-base leading-none">{option.icon}</span>
                  <span>{option.label}</span>
                </span>
              ) : (
                option.label
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

interface MultiSelectFilterProps {
  definition: MultiSelectFilterDefinition
  currentValue: string
}

function MultiSelectFilter({ definition, currentValue }: MultiSelectFilterProps): React.JSX.Element {
  const { setFilterParam } = useUrlParams()
  const triggerId = `multi-select-${definition.paramName}`
  const selectedValues = currentValue.length > 0 ? currentValue.split(MULTI_VALUE_SEPARATOR) : []
  const selectedOptions = definition.options.filter((option) => selectedValues.includes(option.value))
  const triggerLabel = selectedOptions.length > 0
    ? selectedOptions.map((option) => option.label).join(SELECTED_LABELS_SEPARATOR)
    : definition.placeholder

  const handleToggle = (toggledValue: string): void => {
    const nextValues = definition.options
      .map((option) => option.value)
      .filter((value) => (value === toggledValue) !== selectedValues.includes(value))
    setFilterParam(definition.paramName, nextValues.join(MULTI_VALUE_SEPARATOR))
  }

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={triggerId}
        className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
      >
        {definition.label}
      </label>
      <DropdownMenu>
        <DropdownMenuTrigger
          id={triggerId}
          className="flex h-8 w-40 items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <span className={cn('truncate', selectedOptions.length === 0 && 'text-muted-foreground')}>
            {triggerLabel}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {definition.options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selectedValues.includes(option.value)}
              onCheckedChange={() => { handleToggle(option.value) }}
              onSelect={(event) => { event.preventDefault() }}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
