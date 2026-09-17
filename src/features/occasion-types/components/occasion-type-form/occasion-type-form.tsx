'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormSetError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  createOccasionTypeInputSchema,
  updateOccasionTypeInputSchema,
  type CreateOccasionTypeInput,
  type UpdateOccasionTypeInput,
} from '@/data-access/occasion-types/admin-occasion-types.schemas'
import { useTranslate } from '@/lib/i18n/use-translate'

const DEFAULT_SORT_ORDER = 0

export interface EditFormValues {
  slug: string
  emoji: string | null
  sortOrder: number
  isActive: boolean
  labelEn: string
  labelFr: string | null
}

export interface OccasionTypeFormCreateProps {
  mode: 'create'
  onSubmit: (values: CreateOccasionTypeInput, setError: UseFormSetError<CreateOccasionTypeInput>) => void
  onDirtyChange: (isDirty: boolean) => void
  isPending: boolean
}

export interface OccasionTypeFormEditProps {
  mode: 'edit'
  initialValues: EditFormValues
  onSubmit: (values: UpdateOccasionTypeInput, setError: UseFormSetError<UpdateOccasionTypeInput>) => void
  onDirtyChange: (isDirty: boolean) => void
  isPending: boolean
}

export function OccasionTypeCreateForm({
  onSubmit,
  onDirtyChange,
  isPending,
}: OccasionTypeFormCreateProps): React.JSX.Element {
  const t = useTranslate()

  const form = useForm<CreateOccasionTypeInput>({
    resolver: zodResolver(createOccasionTypeInputSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      slug: '',
      emoji: null,
      sortOrder: DEFAULT_SORT_ORDER,
      isActive: true,
      labelEn: '',
      labelFr: null,
    },
  })

  const values = form.watch()
  const isFormValid = createOccasionTypeInputSchema.safeParse(values).success
  const { isDirty } = form.formState
  const canSubmit = isFormValid && isDirty && !isPending

  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  const submitLabel = isPending
    ? t('occasion_types.form.submit_pending')
    : t('occasion_types.form.submit_create')

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
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('occasion_types.form.slug_label')}</FormLabel>
              <FormControl>
                <Input placeholder="my-occasion" disabled={isPending} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emoji"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('occasion_types.form.emoji_label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder="🎂"
                  disabled={isPending}
                  value={field.value ?? ''}
                  onChange={(event) => {
                    const trimmed = event.target.value.trim()
                    field.onChange(trimmed.length > 0 ? trimmed : null)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('occasion_types.form.sort_order_label')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={32767}
                  disabled={isPending}
                  value={field.value}
                  onChange={(event) => {
                    field.onChange(event.target.valueAsNumber)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-3">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                />
              </FormControl>
              <FormLabel className="mb-0">{t('occasion_types.form.is_active_label')}</FormLabel>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="labelEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('occasion_types.form.label_en_label')}</FormLabel>
                <FormControl>
                  <Input disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="labelFr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('occasion_types.form.label_fr_label')}</FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    value={field.value ?? ''}
                    onChange={(event) => {
                      const nextValue = event.target.value
                      field.onChange(nextValue.length > 0 ? nextValue : null)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

export function OccasionTypeEditForm({
  initialValues,
  onSubmit,
  onDirtyChange,
  isPending,
}: OccasionTypeFormEditProps): React.JSX.Element {
  const t = useTranslate()

  const form = useForm<UpdateOccasionTypeInput>({
    resolver: zodResolver(updateOccasionTypeInputSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      emoji: initialValues.emoji,
      sortOrder: initialValues.sortOrder,
      isActive: initialValues.isActive,
      labelEn: initialValues.labelEn,
      labelFr: initialValues.labelFr,
    },
  })

  const values = form.watch()
  const isFormValid = updateOccasionTypeInputSchema.safeParse(values).success
  const { isDirty } = form.formState
  const canSubmit = isFormValid && isDirty && !isPending

  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  const submitLabel = isPending
    ? t('occasion_types.form.submit_pending')
    : t('occasion_types.form.submit_edit')

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
        <div className="flex flex-col gap-1.5">
          <Label>{t('occasion_types.form.slug_label')}</Label>
          <Input value={initialValues.slug} disabled readOnly />
          <p className="text-sm text-muted-foreground">
            {t('occasion_types.form.slug_description_disabled')}
          </p>
        </div>

        <FormField
          control={form.control}
          name="emoji"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('occasion_types.form.emoji_label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder="🎂"
                  disabled={isPending}
                  value={field.value ?? ''}
                  onChange={(event) => {
                    const trimmed = event.target.value.trim()
                    field.onChange(trimmed.length > 0 ? trimmed : null)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('occasion_types.form.sort_order_label')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={32767}
                  disabled={isPending}
                  value={field.value}
                  onChange={(event) => {
                    field.onChange(event.target.valueAsNumber)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-3">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                />
              </FormControl>
              <FormLabel className="mb-0">{t('occasion_types.form.is_active_label')}</FormLabel>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="labelEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('occasion_types.form.label_en_label')}</FormLabel>
                <FormControl>
                  <Input disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="labelFr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('occasion_types.form.label_fr_label')}</FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    value={field.value ?? ''}
                    onChange={(event) => {
                      const nextValue = event.target.value
                      field.onChange(nextValue.length > 0 ? nextValue : null)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
