'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormSetError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
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
import { OccasionTypePicker } from '@/features/occasion-types/components/occasion-type-picker'
import { useTranslate } from '@/lib/i18n/use-translate'

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
              <FormControl>
                <OccasionTypePicker
                  value={typeof field.value === 'string' ? field.value : null}
                  onChange={(next) => { field.onChange(next) }}
                  disabled={isPending}
                />
              </FormControl>
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
