'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CATEGORY_MAX_ALLOWED_DEPTH,
  type ApiCategory,
} from '@/data-access/categories/categories.schemas'
import { useTranslate } from '@/lib/i18n/use-translate'

export const PARENT_CATEGORY_NONE_VALUE = '__none__'
const CHILD_LEVEL_INDENT = '    '

interface ParentCategorySelectProps {
  value: string | null
  onChange: (next: string | null) => void
  categories: readonly ApiCategory[]
  isLoading: boolean
  disabled?: boolean
  excludedIds?: ReadonlySet<string>
  id?: string
  showNoneOption?: boolean
}

function buildIndent(depth: number): string {
  return CHILD_LEVEL_INDENT.repeat(depth)
}

function sortCategoriesForDropdown(
  categories: readonly ApiCategory[],
): readonly ApiCategory[] {
  const byParent = new Map<string | null, ApiCategory[]>()
  for (const category of categories) {
    const bucket = byParent.get(category.parentId) ?? []
    bucket.push(category)
    byParent.set(category.parentId, bucket)
  }
  for (const bucket of byParent.values()) {
    bucket.sort((a, b) => a.name.localeCompare(b.name))
  }

  const ordered: ApiCategory[] = []
  const walk = (parentId: string | null): void => {
    const bucket = byParent.get(parentId) ?? []
    for (const node of bucket) {
      ordered.push(node)
      walk(node.id)
    }
  }
  walk(null)
  return ordered
}

export function ParentCategorySelect({
  value,
  onChange,
  categories,
  isLoading,
  disabled = false,
  excludedIds,
  id,
  showNoneOption = true,
}: ParentCategorySelectProps): React.JSX.Element {
  const t = useTranslate()

  const options = sortCategoriesForDropdown(categories).filter((category) => {
    if (category.depth >= CATEGORY_MAX_ALLOWED_DEPTH) return false
    if (excludedIds?.has(category.id) === true) return false
    return true
  })

  const placeholder = isLoading
    ? t('categories.form.parent_loading_placeholder')
    : t('categories.form.parent_placeholder')

  const selectedValue = value ?? PARENT_CATEGORY_NONE_VALUE

  function handleValueChange(next: string): void {
    if (next === PARENT_CATEGORY_NONE_VALUE) {
      onChange(null)
      return
    }
    onChange(next)
  }

  return (
    <Select
      value={selectedValue}
      onValueChange={handleValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {showNoneOption ? (
          <SelectItem value={PARENT_CATEGORY_NONE_VALUE}>
            {t('categories.form.parent_none_option')}
          </SelectItem>
        ) : null}
        {options.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            <span className="whitespace-pre">
              {buildIndent(category.depth)}
              {category.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
