'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronRight, FolderTree, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import type { ApiCategory } from '@/data-access/categories/categories.schemas'
import { useAdminCategories } from '@/features/categories/hooks/use-admin-categories'
import {
  buildParentPathLabel,
  orderCategoriesTree,
} from '@/features/categories/lib/category-tree'
import { resolveCategoryName } from '@/features/categories/lib/resolve-category-name'
import { useLocaleStore } from '@/lib/i18n/locale-store'
import type { Locale } from '@/lib/i18n/locale'
import { useTranslate } from '@/lib/i18n/use-translate'
import { cn } from '@/lib/utils'

const INDENT_PER_DEPTH_PX = 16

interface CategoriesPickerProps {
  value: readonly string[]
  onChange: (next: string[]) => void
  disabled: boolean
  max: number
}

interface CategoryOption {
  category: ApiCategory
  name: string
  pathLabel: string
  parentLabel: string | null
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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const selectedCategories = useMemo<ApiCategory[]>(() => {
    const byId = new Map(categories.map((category) => [category.id, category]))
    return value
      .map((id) => byId.get(id) ?? null)
      .filter((category): category is ApiCategory => category !== null)
  }, [value, categories])

  const treeOrderedOptions = useMemo<CategoryOption[]>(
    () => buildTreeOrderedOptions(categories, locale),
    [categories, locale],
  )

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

  useEffect(() => {
    if (atMax && isPopoverOpen) setIsPopoverOpen(false)
  }, [atMax, isPopoverOpen])

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
    return <p className="text-sm text-destructive">{t('items.form.categories_error')}</p>
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <div className="flex flex-col gap-2">
        {selectedCategories.length === 0 ? null : (
          <div className="flex flex-wrap items-center gap-2">
            {selectedCategories.map((category) => {
              const label = buildParentPathLabel(category, categories, locale)
              return (
                <Badge
                  key={category.id}
                  variant="outline"
                  className="gap-1.5 border-primary/40 bg-primary/10 pl-3 pr-1.5 py-1 text-sm font-normal text-foreground"
                >
                  <span>{label}</span>
                  <button
                    type="button"
                    aria-label={t('items.form.categories_remove_chip_label', { name: label })}
                    disabled={disabled}
                    onClick={() => { handleRemoveChip(category.id) }}
                    className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full hover:bg-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Badge>
              )
            })}
          </div>
        )}

        {atMax ? null : (
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              className="w-full justify-start hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
            >
              <FolderTree className="mr-1.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              {t('items.form.categories_add_button')}
            </Button>
          </PopoverTrigger>
        )}
      </div>
      <PopoverContent
        withoutPortal
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command>
          <CommandInput
            autoFocus
            placeholder={t('items.form.categories_search_placeholder')}
          />
          <CommandList>
            {treeOrderedOptions.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                {t('items.form.categories_empty_options')}
              </div>
            ) : (
              <>
                <CommandEmpty>{t('items.form.categories_empty_search')}</CommandEmpty>
                {treeOrderedOptions.map((option) => (
                  <CategoryOptionRow
                    key={option.category.id}
                    option={option}
                    isSelected={value.includes(option.category.id)}
                    onToggle={handleToggle}
                  />
                ))}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface CategoryOptionRowProps {
  option: CategoryOption
  isSelected: boolean
  onToggle: (categoryId: string) => void
}

function CategoryOptionRow({
  option,
  isSelected,
  onToggle,
}: CategoryOptionRowProps): React.JSX.Element {
  const { category, name, pathLabel, parentLabel } = option
  return (
    <CommandItem
      value={category.id}
      keywords={[name, category.slug, pathLabel]}
      onSelect={() => { onToggle(category.id) }}
      className={cn(
        'flex cursor-pointer items-center gap-2',
        isSelected && 'bg-primary/10 text-foreground',
      )}
    >
      <span
        aria-hidden="true"
        style={{ width: `${String(category.depth * INDENT_PER_DEPTH_PX)}px` }}
      />
      {category.depth > 0 ? (
        <ChevronRight
          className={cn(
            'h-3.5 w-3.5 shrink-0',
            isSelected ? 'text-primary' : 'text-muted-foreground/60',
          )}
          aria-hidden="true"
        />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className={cn('truncate', isSelected && 'font-medium')}>{name}</span>
        {parentLabel !== null ? (
          <span className="truncate text-xs text-muted-foreground">{parentLabel}</span>
        ) : null}
      </div>
      <Check
        className={cn(
          'h-4 w-4 shrink-0 text-primary',
          isSelected ? 'opacity-100' : 'opacity-0',
        )}
      />
    </CommandItem>
  )
}

function buildTreeOrderedOptions(
  categories: readonly ApiCategory[],
  locale: Locale,
): CategoryOption[] {
  const byId = new Map(categories.map((category) => [category.id, category]))
  return orderCategoriesTree(categories, locale).map((category) => {
    const name = resolveCategoryName(category, locale)
    const parent = category.parentId === null ? null : (byId.get(category.parentId) ?? null)
    const parentLabel = parent === null ? null : buildParentPathLabel(parent, categories, locale)
    const pathLabel = parentLabel === null ? name : `${parentLabel} / ${name}`
    return { category, name, pathLabel, parentLabel }
  })
}
