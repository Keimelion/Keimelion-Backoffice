'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormSetError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  createTagInputSchema,
  type ApiTag,
  type CreateTagInput,
} from '@/data-access/tags/tags.schemas'
import { useTranslate } from '@/lib/i18n/use-translate'
import { useAutoSlug } from '@/lib/use-auto-slug'

export type TagFormValues = CreateTagInput

type TagFormProps =
  | {
      mode: 'create'
      onSubmit: (values: TagFormValues, setError: UseFormSetError<TagFormValues>) => void
      onDirtyChange: (isDirty: boolean) => void
      isPending: boolean
    }
  | {
      mode: 'edit'
      tag: ApiTag
      onSubmit: (values: TagFormValues, setError: UseFormSetError<TagFormValues>) => void
      onDirtyChange: (isDirty: boolean) => void
      isPending: boolean
    }

function buildDefaultValues(props: TagFormProps): TagFormValues {
  if (props.mode === 'edit') {
    return { name: props.tag.name, slug: props.tag.slug }
  }
  return { name: '', slug: '' }
}

export function TagForm(props: TagFormProps): React.JSX.Element {
  const { mode, onSubmit, onDirtyChange, isPending } = props
  const t = useTranslate()
  const isEdit = mode === 'edit'

  const form = useForm<TagFormValues>({
    resolver: zodResolver(createTagInputSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: buildDefaultValues(props),
  })

  useAutoSlug({ form, nameField: 'name', slugField: 'slug', enabled: !isEdit })

  const values = form.watch()
  const isFormValid = createTagInputSchema.safeParse(values).success
  const { isDirty } = form.formState
  const canSubmit = isFormValid && isDirty && !isPending

  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  const submitLabel = isPending
    ? t('tags.form.submit_pending')
    : isEdit
      ? t('tags.form.submit_edit')
      : t('tags.form.submit_create')

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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t('tags.form.name_label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('tags.form.name_label')}
                  disabled={isPending}
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t('tags.form.slug_label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('tags.form.slug_placeholder')}
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
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
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
