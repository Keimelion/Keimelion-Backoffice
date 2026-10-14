'use client'

import { useMemo } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ApiCategory } from '@/data-access/categories/categories.schemas'
import { useAdminCategories } from '@/features/categories/hooks/use-admin-categories'
import { buildParentPathLabel } from '@/features/categories/lib/category-tree'
import { useLocaleStore } from '@/lib/i18n/locale-store'
import { useTranslate } from '@/lib/i18n/use-translate'

interface CategoriesPickerProps {
  value: readonly string[]
  onChange: (next: string[]) => void
  disabled: boolean
  max: number
}

interface CategoryOption {
  category: ApiCategory
  label: string
}

export function CategoriesPicker({
  value,
  onChange,
  disabled,
  max,
}: CategoriesPickerProps): React.JSX.Element {
  const t = useTranslate()
  const locale = useLocaleStore((state) => state.locale)
  const categoriesQuery = useAdminCategories()
  const categories = categoriesQuery.data ?? []

  const selectedCategories = useMemo<ApiCategory[]>(() => {
    const byId = new Map(categories.map((category) => [category.id, category]))
    return value
      .map((id) => byId.get(id) ?? null)
      .filter((category): category is ApiCategory => category !== null)
  }, [value, categories])

  const sortedOptions = useMemo<CategoryOption[]>(() => {
    const options = categories.map((category) => ({
      category,
      label: buildParentPathLabel(category, categories, locale),
    }))
    options.sort((left, right) => left.label.localeCompare(right.label))
    return options
  }, [categories, locale])

  const atMax = value.length >= max

  function handleToggle(categoryId: string): void {
    if (value.includes(categoryId)) {
      onChange(value.filter((id) => id !== categoryId))
      return
    }
    if (atMax) return
    onChange([...value, categoryId])
  }

  function handleRemoveChip(categoryId: string): void {
    onChange(value.filter((id) => id !== categoryId))
  }

  if (categoriesQuery.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-40" />
        <span className="text-xs text-muted-foreground">
          {t('items.form.categories_loading')}
        </span>
      </div>
    )
  }

  if (categoriesQuery.isError) {
    return (
      <p className="text-sm text-destructive">{t('items.form.categories_error')}</p>
    )
  }

  const triggerLabel = atMax
    ? t('items.form.categories_add_button_at_max', { max })
    : t('items.form.categories_add_button')

  return (
    <div className="flex flex-col gap-2">
      {selectedCategories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category) => {
            const label = buildParentPathLabel(category, categories, locale)
            return (
              <Badge
                key={category.id}
                variant="secondary"
                className="gap-1 pl-2 pr-1 text-sm font-normal"
              >
                <span>{label}</span>
                <button
                  type="button"
                  aria-label={t('items.form.categories_remove_chip_label', { name: label })}
                  disabled={disabled}
                  onClick={() => { handleRemoveChip(category.id) }}
                  className="rounded-sm p-0.5 hover:bg-muted-foreground/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || (atMax && selectedCategories.length === 0)}
            className="self-start"
          >
            <span>{triggerLabel}</span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-72 w-72">
          {sortedOptions.length === 0 ? (
            <DropdownMenuLabel className="text-muted-foreground">
              {t('items.form.categories_empty_options')}
            </DropdownMenuLabel>
          ) : (
            sortedOptions.map((option) => {
              const isSelected = value.includes(option.category.id)
              const isDisabledOption = disabled || (!isSelected && atMax)
              return (
                <DropdownMenuCheckboxItem
                  key={option.category.id}
                  checked={isSelected}
                  disabled={isDisabledOption}
                  onCheckedChange={() => { handleToggle(option.category.id) }}
                  onSelect={(event) => { event.preventDefault() }}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              )
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
