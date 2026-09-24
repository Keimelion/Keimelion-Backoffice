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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createItemSourceInputSchema, type CreateItemSourceInput } from '@/data-access/items/item-sources.schemas'
import { useShops } from '@/features/shops/hooks/use-shops'
import { useTranslate } from '@/lib/i18n/use-translate'

export type ItemSourceFormValues = CreateItemSourceInput

const NO_SHOP_VALUE = '__no_shop__'
const DEFAULT_CURRENCY = 'EUR'

type ItemSourceFormProps =
  | {
      mode: 'create'
      initialValues?: never
      onSubmit: (values: ItemSourceFormValues, setError: UseFormSetError<ItemSourceFormValues>) => void
      onDirtyChange: (isDirty: boolean) => void
      isPending: boolean
    }
  | {
      mode: 'edit'
      initialValues: ItemSourceFormValues
      onSubmit: (values: ItemSourceFormValues, setError: UseFormSetError<ItemSourceFormValues>) => void
      onDirtyChange: (isDirty: boolean) => void
      isPending: boolean
    }

function buildDefaultValues(props: ItemSourceFormProps): ItemSourceFormValues {
  if (props.mode === 'edit') return props.initialValues
  return {
    shopId: null,
    sourceUrl: null,
    price: null,
    currency: DEFAULT_CURRENCY,
    isPrimary: false,
  }
}

export function ItemSourceForm(props: ItemSourceFormProps): React.JSX.Element {
  const { mode, onSubmit, onDirtyChange, isPending } = props
  const t = useTranslate()
  const isEdit = mode === 'edit'
  const shopsQuery = useShops()
  const shops = shopsQuery.data ?? []

  const form = useForm<ItemSourceFormValues>({
    resolver: zodResolver(createItemSourceInputSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: buildDefaultValues(props),
  })

  const values = form.watch()
  const isFormValid = createItemSourceInputSchema.safeParse(values).success
  const { isDirty } = form.formState
  const canSubmit = isFormValid && isDirty && !isPending

  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  const submitLabel = isPending
    ? t('items.source_form.submit_pending')
    : isEdit
      ? t('items.source_form.submit_edit')
      : t('items.source_form.submit_create')

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
          name="sourceUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('items.source_form.source_url_label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('items.source_form.source_url_placeholder')}
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('items.source_form.price_label')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('items.source_form.price_placeholder')}
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
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('items.source_form.currency_label')}</FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    maxLength={3}
                    {...field}
                    onChange={(event) => {
                      field.onChange(event.target.value.toUpperCase())
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="shopId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('items.source_form.shop_label')}</FormLabel>
              <Select
                value={field.value ?? NO_SHOP_VALUE}
                onValueChange={(next) => { field.onChange(next === NO_SHOP_VALUE ? null : next) }}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('items.source_form.shop_placeholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NO_SHOP_VALUE}>{t('items.source_form.shop_none_option')}</SelectItem>
                  {shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPrimary"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-3">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isPending} />
              </FormControl>
              <FormLabel className="mb-0">{t('items.source_form.is_primary_label')}</FormLabel>
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
