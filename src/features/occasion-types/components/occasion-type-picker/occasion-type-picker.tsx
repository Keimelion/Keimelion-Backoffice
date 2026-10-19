'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, Sparkles } from 'lucide-react'
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
import type { ApiOccasionType } from '@/data-access/occasion-types/occasion-types.schemas'
import { useOccasionTypes } from '@/features/occasion-types/hooks/use-occasion-types'
import { useTranslate } from '@/lib/i18n/use-translate'
import { cn } from '@/lib/utils'

const NONE_VALUE = '__none__'

interface OccasionTypePickerProps {
  value: string | null
  onChange: (next: string | null) => void
  disabled: boolean
}

export function OccasionTypePicker({
  value,
  onChange,
  disabled,
}: OccasionTypePickerProps): React.JSX.Element {
  const t = useTranslate()
  const occasionTypesQuery = useOccasionTypes()
  const occasionTypes = occasionTypesQuery.data ?? []
  const [isOpen, setIsOpen] = useState(false)

  if (occasionTypesQuery.isLoading) {
    return <Skeleton className="h-9 w-full" />
  }

  if (occasionTypesQuery.isError) {
    return <p className="text-sm text-destructive">{occasionTypesQuery.error.message}</p>
  }

  const selected =
    value === null ? null : occasionTypes.find((occasion) => occasion.id === value) ?? null

  function handleSelect(nextValue: string | null): void {
    onChange(nextValue)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          className="w-full justify-between font-normal hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
        >
          <span className="flex min-w-0 items-center gap-2">
            <OccasionGlyph emoji={selected?.emoji ?? null} />
            <span className={cn('truncate', selected === null && 'text-muted-foreground')}>
              {selected?.label ?? t('lists.form.occasion_type_placeholder')}
            </span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        withoutPortal
        align="start"
        collisionPadding={16}
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command>
          <CommandInput
            autoFocus
            placeholder={t('lists.form.occasion_type_search_placeholder')}
          />
          <CommandList>
            <CommandEmpty>{t('lists.form.occasion_type_empty')}</CommandEmpty>
            <CommandItem
              value={NONE_VALUE}
              keywords={[t('lists.form.occasion_type_none')]}
              onSelect={() => { handleSelect(null) }}
              className="flex cursor-pointer items-center gap-2"
            >
              <OccasionGlyph emoji={null} muted />
              <span className={cn('flex-1 truncate text-muted-foreground', value === null && 'font-medium text-foreground')}>
                {t('lists.form.occasion_type_none')}
              </span>
              <Check
                className={cn('h-4 w-4 shrink-0 text-primary', value === null ? 'opacity-100' : 'opacity-0')}
                aria-hidden="true"
              />
            </CommandItem>
            {occasionTypes.map((occasion) => (
              <OccasionRow
                key={occasion.id}
                occasion={occasion}
                isSelected={occasion.id === value}
                onSelect={handleSelect}
              />
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface OccasionRowProps {
  occasion: ApiOccasionType
  isSelected: boolean
  onSelect: (id: string) => void
}

function OccasionRow({ occasion, isSelected, onSelect }: OccasionRowProps): React.JSX.Element {
  return (
    <CommandItem
      value={occasion.label}
      keywords={[occasion.slug]}
      onSelect={() => { onSelect(occasion.id) }}
      className={cn(
        'flex cursor-pointer items-center gap-2',
        isSelected && 'bg-primary/10',
      )}
    >
      <OccasionGlyph emoji={occasion.emoji} />
      <span className={cn('flex-1 truncate', isSelected && 'font-medium')}>{occasion.label}</span>
      <Check
        className={cn('h-4 w-4 shrink-0 text-primary', isSelected ? 'opacity-100' : 'opacity-0')}
        aria-hidden="true"
      />
    </CommandItem>
  )
}

interface OccasionGlyphProps {
  emoji: string | null
  muted?: boolean
}

function OccasionGlyph({ emoji, muted = false }: OccasionGlyphProps): React.JSX.Element {
  if (emoji !== null && emoji.length > 0) {
    return (
      <span aria-hidden="true" className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-base leading-none">
        {emoji}
      </span>
    )
  }
  return (
    <Sparkles
      aria-hidden="true"
      className={cn('h-4 w-4 shrink-0', muted ? 'text-muted-foreground/60' : 'text-muted-foreground')}
    />
  )
}
