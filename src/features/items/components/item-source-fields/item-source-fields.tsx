'use client'

import { useFormContext } from 'react-hook-form'
import type { FieldValues, Path } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  SUPPORTED_CURRENCIES,
  type ItemSourceShop,
} from '@/data-access/items/item-sources.schemas'
import { useTranslate } from '@/lib/i18n/use-translate'

const NO_SHOP_VALUE = '__none__'

interface ItemSourceFieldsProps<TValues extends FieldValues> {
  namePrefix: Path<TValues> | ''
  shops: readonly ItemSourceShop[]
  isShopsLoading: boolean
  disabled: boolean
  disabledShopIds?: ReadonlySet<string> | undefined
}

export function ItemSourceFields<TValues extends FieldValues>({
  namePrefix,
  shops,
  isShopsLoading,
  disabled,
  disabledShopIds,
}: ItemSourceFieldsProps<TValues>): React.JSX.Element {
  const form = useFormContext<TValues>()
  const t = useTranslate()
  const prefix = namePrefix === '' ? '' : `${namePrefix}.`

  const sourceUrlName = `${prefix}sourceUrl` as Path<TValues>
  const priceName = `${prefix}price` as Path<TValues>
  const currencyName = `${prefix}currency` as Path<TValues>
  const shopIdName = `${prefix}shopId` as Path<TValues>

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
      <FormField
        control={form.control}
        name={sourceUrlName}
        render={({ field }) => (
          <FormItem className="sm:col-span-6">
            <FormLabel>{t('items.form.source_url_label')}</FormLabel>
            <FormControl>
              <Input
                type="url"
                placeholder={t('items.form.source_url_placeholder')}
                disabled={disabled}
                value={typeof field.value === 'string' ? field.value : ''}
                onChange={(event) => {
                  const next = event.target.value
                  field.onChange(next.length > 0 ? next : null)
                }}
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
        name={priceName}
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>{t('items.form.source_price_label')}</FormLabel>
            <FormControl>
              <Input
                inputMode="decimal"
                placeholder={t('items.form.source_price_placeholder')}
                disabled={disabled}
                value={typeof field.value === 'string' ? field.value : ''}
                onChange={(event) => {
                  const next = event.target.value
                  field.onChange(next.length > 0 ? next : null)
                }}
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
        name={currencyName}
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel required>{t('items.form.source_currency_label')}</FormLabel>
            <Select
              value={typeof field.value === 'string' ? field.value : ''}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
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
        name={shopIdName}
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>{t('items.form.source_shop_label')}</FormLabel>
            <Select
              value={typeof field.value === 'string' ? field.value : NO_SHOP_VALUE}
              onValueChange={(value) => {
                field.onChange(value === NO_SHOP_VALUE ? null : value)
              }}
              disabled={disabled || isShopsLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('items.form.source_shop_placeholder')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={NO_SHOP_VALUE}>
                  {t('items.form.source_shop_none')}
                </SelectItem>
                {shops.map((shop) => (
                  <SelectItem
                    key={shop.id}
                    value={shop.id}
                    disabled={disabledShopIds?.has(shop.id) === true}
                  >
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
