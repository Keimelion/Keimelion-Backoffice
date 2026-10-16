'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
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
import type { ApiTag } from '@/data-access/tags/tags.schemas'
import { useAdminTags } from '@/features/tags/hooks/use-admin-tags'
import { useTranslate } from '@/lib/i18n/use-translate'

const CREATE_ITEM_PREFIX = '__create__:'

interface TagsPickerProps {
  value: readonly string[]
  onChange: (next: string[]) => void
  disabled: boolean
  max: number
  maxNameLength: number
}

export function TagsPicker({
  value,
  onChange,
  disabled,
  max,
  maxNameLength,
}: TagsPickerProps): React.JSX.Element {
  const t = useTranslate()
  const tagsQuery = useAdminTags()
  const existingTags = tagsQuery.data ?? []
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [searchText, setSearchText] = useState('')

  const selectedKeySet = useMemo<Set<string>>(
    () => new Set(value.map((name) => normalizeTagKey(name))),
    [value],
  )

  const trimmedSearch = searchText.trim()
  const availableTags = useMemo<ApiTag[]>(
    () =>
      existingTags.filter(
        (tag) => !selectedKeySet.has(normalizeTagKey(tag.name)),
      ),
    [existingTags, selectedKeySet],
  )

  const atMax = value.length >= max
  const canCreateFromSearch =
    trimmedSearch.length > 0
    && trimmedSearch.length <= maxNameLength
    && !selectedKeySet.has(normalizeTagKey(trimmedSearch))
    && !existingTags.some(
      (tag) => normalizeTagKey(tag.name) === normalizeTagKey(trimmedSearch),
    )

  function addTag(name: string): void {
    const trimmed = name.trim()
    if (trimmed.length === 0) return
    if (trimmed.length > maxNameLength) return
    if (atMax) return
    if (selectedKeySet.has(normalizeTagKey(trimmed))) return
    onChange([...value, trimmed])
    setSearchText('')
  }

  function handleRemoveChip(name: string): void {
    onChange(value.filter((entry) => entry !== name))
  }

  function handleSelect(selectValue: string): void {
    if (selectValue.startsWith(CREATE_ITEM_PREFIX)) {
      addTag(selectValue.slice(CREATE_ITEM_PREFIX.length))
      return
    }
    addTag(selectValue)
  }

  useEffect(() => {
    if (atMax && isPopoverOpen) setIsPopoverOpen(false)
  }, [atMax, isPopoverOpen])

  if (tagsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-40" />
        <span className="text-xs text-muted-foreground">
          {t('items.form.tags_loading')}
        </span>
      </div>
    )
  }

  if (tagsQuery.isError) {
    return <p className="text-sm text-destructive">{t('items.form.tags_error')}</p>
  }

  return (
    <Popover
      open={isPopoverOpen}
      onOpenChange={(nextOpen) => {
        setIsPopoverOpen(nextOpen)
        if (!nextOpen) setSearchText('')
      }}
    >
      <div className="flex flex-col gap-2">
        {value.length === 0 ? null : (
          <div className="flex flex-wrap items-center gap-2">
            {value.map((name) => (
              <Badge
                key={name}
                variant="outline"
                className="gap-1.5 border-primary/40 bg-primary/10 pl-3 pr-1.5 py-1 text-sm font-normal text-foreground"
              >
                <span>{name}</span>
                <button
                  type="button"
                  aria-label={t('items.form.tags_remove_chip_label', { name })}
                  disabled={disabled}
                  onClick={() => { handleRemoveChip(name) }}
                  className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full hover:bg-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {atMax ? null : (
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              className="w-full justify-start"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              {t('items.form.tags_add_button')}
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
            value={searchText}
            onValueChange={setSearchText}
            placeholder={t('items.form.tags_search_placeholder')}
            maxLength={maxNameLength}
          />
          <CommandList>
            {availableTags.length === 0 && !canCreateFromSearch ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                {trimmedSearch.length === 0
                  ? t('items.form.tags_empty_options')
                  : t('items.form.tags_empty_search')}
              </div>
            ) : (
              <>
                <CommandEmpty>{t('items.form.tags_empty_search')}</CommandEmpty>
                {canCreateFromSearch ? (
                  <CommandItem
                    value={`${CREATE_ITEM_PREFIX}${trimmedSearch}`}
                    keywords={[trimmedSearch]}
                    onSelect={handleSelect}
                    className="flex cursor-pointer items-center gap-2 data-[selected=true]:bg-primary/15 data-[selected=true]:text-foreground"
                  >
                    <Plus className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span className="truncate">
                      {t('items.form.tags_create_option', { name: trimmedSearch })}
                    </span>
                  </CommandItem>
                ) : null}
                {availableTags.map((tag) => (
                  <TagOptionRow
                    key={tag.id}
                    tag={tag}
                    onSelect={handleSelect}
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

interface TagOptionRowProps {
  tag: ApiTag
  onSelect: (value: string) => void
}

function TagOptionRow({ tag, onSelect }: TagOptionRowProps): React.JSX.Element {
  return (
    <CommandItem
      value={tag.name}
      keywords={[tag.slug]}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2 data-[selected=true]:bg-primary/15 data-[selected=true]:text-foreground"
    >
      <span className="truncate">{tag.name}</span>
    </CommandItem>
  )
}

function normalizeTagKey(name: string): string {
  return name.trim().toLowerCase()
}
