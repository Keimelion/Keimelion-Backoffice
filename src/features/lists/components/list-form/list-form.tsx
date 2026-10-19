'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormSetError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import {
  editListFormResolverSchema,
  LIST_TAGS_MAX,
  LIST_TAG_NAME_MAX_LENGTH,
  updateListInputSchema,
  type ApiAdminList,
  type UpdateListInput,
} from '@/data-access/lists/lists.schemas'
import { TagsPicker } from '@/features/items/components/item-form/tags-picker'
import { useOccasionTypes } from '@/features/occasion-types/hooks/use-occasion-types'
import { useTranslate } from '@/lib/i18n/use-translate'
import { cn } from '@/lib/utils'

export type ListFormEditValues = UpdateListInput

interface ListFormProps {
  mode: 'edit'
  list: ApiAdminList
  onSubmit: (values: ListFormEditValues, setError: UseFormSetError<ListFormEditValues>) => void
  onDirtyChange: (isDirty: boolean) => void
  isPending: boolean
}

function buildDefaultValues(list: ApiAdminList): ListFormEditValues {
  return {
    title: list.title,
    description: list.description,
    occasionTypeId: list.occasionTypeId,
    tags: list.tags.map((tag) => tag.name),
  }
}

export function ListForm(props: ListFormProps): React.JSX.Element {
  const { list, onDirtyChange, isPending, onSubmit } = props
  const t = useTranslate()

  const occasionTypesQuery = useOccasionTypes()
  const occasionTypes = occasionTypesQuery.data ?? []

  const [isOccasionOpen, setIsOccasionOpen] = useState(false)

  const defaultValues = useMemo(() => buildDefaultValues(list), [list])

  const form = useForm<ListFormEditValues>({
    resolver: zodResolver(editListFormResolverSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues,
  })

  const values = form.watch()
  const isFormValid = updateListInputSchema.safeParse(values).success
  const { isDirty } = form.formState
  const canSubmit = isFormValid && isDirty && !isPending

  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  const selectedOccasion =
    typeof values.occasionTypeId === 'string'
      ? occasionTypes.find((occasionType) => occasionType.id === values.occasionTypeId) ?? null
      : null

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          void form.handleSubmit((submittedValues) => {
            onSubmit(submittedValues, form.setError)
          })(event)
        }}
        noValidate
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t('lists.form.title_label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('lists.form.title_placeholder')}
                  disabled={isPending}
                  value={typeof field.value === 'string' ? field.value : ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('lists.form.description_label')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('lists.form.description_placeholder')}
                  disabled={isPending}
                  value={typeof field.value === 'string' ? field.value : ''}
                  onChange={(event) => {
                    const next = event.target.value
                    field.onChange(next.length > 0 ? next : null)
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  rows={3}
                />
              </FormControl>
              <FormDescription>{t('lists.form.description_help')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="occasionTypeId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('lists.form.occasion_type_label')}</FormLabel>
              <Popover open={isOccasionOpen} onOpenChange={setIsOccasionOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      disabled={isPending || occasionTypesQuery.isLoading}
                      className={cn(
                        'justify-between',
                        selectedOccasion === null && 'text-muted-foreground',
                      )}
                    >
                      {selectedOccasion?.label ?? t('lists.form.occasion_type_placeholder')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  withoutPortal
                  align="start"
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                >
                  <Command>
                    <CommandInput placeholder={t('lists.form.occasion_type_search_placeholder')} />
                    <CommandList>
                      <CommandEmpty>{t('lists.form.occasion_type_empty')}</CommandEmpty>
                      <CommandItem
                        value="__none__"
                        onSelect={() => {
                          field.onChange(null)
                          setIsOccasionOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            field.value === null ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        {t('lists.form.occasion_type_none')}
                      </CommandItem>
                      {occasionTypes.map((occasionType) => (
                        <CommandItem
                          key={occasionType.id}
                          value={occasionType.label}
                          keywords={[occasionType.slug]}
                          onSelect={() => {
                            field.onChange(occasionType.id)
                            setIsOccasionOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              field.value === occasionType.id ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          {occasionType.label}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('lists.form.tags_label')}</FormLabel>
              <FormControl>
                <TagsPicker
                  value={field.value ?? []}
                  onChange={(nextTags) => { field.onChange(nextTags) }}
                  disabled={isPending}
                  max={LIST_TAGS_MAX}
                  maxNameLength={LIST_TAG_NAME_MAX_LENGTH}
                />
              </FormControl>
              <FormDescription>
                {t('lists.form.tags_help', { max: LIST_TAGS_MAX })}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root ? (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={!canSubmit}>
            {isPending ? t('lists.form.submit_pending') : t('lists.form.submit_edit')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
