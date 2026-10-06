'use client'

import { useEffect } from 'react'
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
import { Switch } from '@/components/ui/switch'
import {
  createShopInputSchema,
  type AdminShop,
  type CreateShopInput,
} from '@/data-access/shops/admin-shops.schemas'
import { useTranslate } from '@/lib/i18n/use-translate'

const DEFAULT_SORT_ORDER = 0
const SORT_ORDER_MAX = 32767
const HTTPS_PREFIX = 'https://'

export type ShopFormValues = CreateShopInput

type ShopFormProps =
  | {
      mode: 'create'
      initialValues?: never
      onSubmit: (values: ShopFormValues, setError: UseFormSetError<ShopFormValues>) => void
      onDirtyChange: (isDirty: boolean) => void
      isPending: boolean
    }
  | {
      mode: 'edit'
      shop: AdminShop
      onSubmit: (values: ShopFormValues, setError: UseFormSetError<ShopFormValues>) => void
      onDirtyChange: (isDirty: boolean) => void
      isPending: boolean
    }

function buildDefaultValues(props: ShopFormProps): ShopFormValues {
  if (props.mode === 'edit') {
    return {
      slug: props.shop.slug,
      name: props.shop.name,
      domain: props.shop.domain,
      logoUrl: props.shop.logoUrl,
      isAffiliated: props.shop.isAffiliated,
      sortOrder: props.shop.sortOrder,
      isActive: props.shop.isActive,
    }
  }
  return {
    slug: '',
    name: '',
    domain: null,
    logoUrl: null,
    isAffiliated: false,
    sortOrder: DEFAULT_SORT_ORDER,
    isActive: true,
  }
}

export function ShopForm(props: ShopFormProps): React.JSX.Element {
  const { mode, onSubmit, onDirtyChange, isPending } = props
  const t = useTranslate()
  const isEdit = mode === 'edit'

  const form = useForm<ShopFormValues>({
    resolver: zodResolver(createShopInputSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: buildDefaultValues(props),
  })

  const values = form.watch()
  const isFormValid = createShopInputSchema.safeParse(values).success
  const { isDirty } = form.formState
  const canSubmit = isFormValid && isDirty && !isPending

  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  const submitLabel = isPending
    ? t('shops.form.submit_pending')
    : isEdit
      ? t('shops.form.submit_edit')
      : t('shops.form.submit_create')

  const logoPreviewUrl =
    typeof values.logoUrl === 'string' && values.logoUrl.startsWith(HTTPS_PREFIX)
      ? values.logoUrl
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
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t('shops.form.slug_label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('shops.form.slug_placeholder')}
                  disabled={isPending || isEdit}
                  readOnly={isEdit}
                  {...field}
                />
              </FormControl>
              {isEdit ? (
                <FormDescription>{t('shops.form.slug_description_disabled')}</FormDescription>
              ) : (
                <FormMessage />
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t('shops.form.name_label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('shops.form.name_placeholder')}
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('shops.form.domain_label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('shops.form.domain_placeholder')}
                  disabled={isPending}
                  value={field.value ?? ''}
                  onChange={(event) => {
                    const next = event.target.value
                    field.onChange(next.length > 0 ? next : null)
                  }}
                />
              </FormControl>
              <FormDescription>{t('shops.form.domain_help')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('shops.form.logo_url_label')}</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder={t('shops.form.logo_url_placeholder')}
                  disabled={isPending}
                  value={field.value ?? ''}
                  onChange={(event) => {
                    const next = event.target.value
                    field.onChange(next.length > 0 ? next : null)
                  }}
                />
              </FormControl>
              <FormDescription>{t('shops.form.logo_url_help')}</FormDescription>
              <FormMessage />
              {logoPreviewUrl !== null ? (
                <img
                  src={logoPreviewUrl}
                  alt={t('shops.form.logo_preview_alt')}
                  className="mt-2 h-12 w-12 rounded-md border border-border object-contain"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : null}
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('shops.form.sort_order_label')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={SORT_ORDER_MAX}
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
            name="isAffiliated"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-3">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
                </FormControl>
                <FormLabel className="mb-0">{t('shops.form.is_affiliated_label')}</FormLabel>
              </FormItem>
            )}
          />
        </div>

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
              <FormLabel className="mb-0">{t('shops.form.is_active_label')}</FormLabel>
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
