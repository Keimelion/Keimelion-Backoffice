'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormSetError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ModerationStatuses, MODERATION_STATUS_VALUES } from '@keimelion/api/shared/enums/moderation-status'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createItemInputSchema, type CreateItemInput } from '@/data-access/items/items.schemas'
import { ModerationStatusBadge } from '@/features/items/components/moderation-status-badge'
import { useTranslate } from '@/lib/i18n/use-translate'

export type ItemFormValues = CreateItemInput

type ItemFormProps =
  | {
      mode: 'create'
      initialValues?: never
      onSubmit: (values: ItemFormValues, setError: UseFormSetError<ItemFormValues>) => void
      onDirtyChange: (isDirty: boolean) => void
      isPending: boolean
    }
  | {
      mode: 'edit'
      initialValues: ItemFormValues
      onSubmit: (values: ItemFormValues, setError: UseFormSetError<ItemFormValues>) => void
      onDirtyChange: (isDirty: boolean) => void
      isPending: boolean
    }

function buildDefaultValues(props: ItemFormProps): ItemFormValues {
  if (props.mode === 'edit') return props.initialValues
  return {
    name: '',
    description: null,
    imageUrl: null,
    moderationStatus: ModerationStatuses.APPROVED,
  }
}

export function ItemForm(props: ItemFormProps): React.JSX.Element {
  const { mode, onSubmit, onDirtyChange, isPending } = props
  const t = useTranslate()
  const isEdit = mode === 'edit'

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(createItemInputSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: buildDefaultValues(props),
  })

  const values = form.watch()
  const isFormValid = createItemInputSchema.safeParse(values).success
  const { isDirty } = form.formState
  const canSubmit = isFormValid && isDirty && !isPending

  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  const submitLabel = isPending
    ? t('items.form.submit_pending')
    : isEdit
      ? t('items.form.submit_edit')
      : t('items.form.submit_create')

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
              <FormLabel>{t('items.form.name_label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('items.form.name_placeholder')} disabled={isPending} {...field} />
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
              <FormLabel>{t('items.form.description_label')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('items.form.description_placeholder')}
                  disabled={isPending}
                  value={field.value ?? ''}
                  onChange={(event) => {
                    const next = event.target.value
                    field.onChange(next.length > 0 ? next : null)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('items.form.image_url_label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('items.form.image_url_placeholder')}
                  disabled={isPending}
                  value={field.value ?? ''}
                  onChange={(event) => {
                    const next = event.target.value
                    field.onChange(next.length > 0 ? next : null)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="moderationStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('items.form.moderation_status_label')}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MODERATION_STATUS_VALUES.map((status) => (
                    <SelectItem key={status} value={status}>
                      <ModerationStatusBadge status={status} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
