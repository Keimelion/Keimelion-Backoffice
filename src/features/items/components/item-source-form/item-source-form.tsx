'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormSetError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import {
  EMPTY_ITEM_SOURCE_INPUT,
  itemSourceInputSchema,
  type ApiItemSource,
  type ItemSourceInput,
} from '@/data-access/items/item-sources.schemas'
import { useAdminShops } from '@/features/shops/hooks/use-admin-shops'
import { ItemSourceFields } from '@/features/items/components/item-source-fields'
import { useTranslate } from '@/lib/i18n/use-translate'

export type ItemSourceFormValues = ItemSourceInput

interface ItemSourceFormBaseProps {
  onSubmit: (values: ItemSourceFormValues, setError: UseFormSetError<ItemSourceFormValues>) => void
  onDirtyChange: (isDirty: boolean) => void
  isPending: boolean
  disabledShopIds?: ReadonlySet<string> | undefined
}

type ItemSourceFormProps =
  | ({ mode: 'create' } & ItemSourceFormBaseProps)
  | ({ mode: 'edit'; source: ApiItemSource } & ItemSourceFormBaseProps)

function buildDefaultValues(props: ItemSourceFormProps): ItemSourceFormValues {
  if (props.mode === 'edit') {
    return {
      shopId: props.source.shopId,
      sourceUrl: props.source.sourceUrl,
      price: props.source.price,
      currency: props.source.currency,
    }
  }
  return EMPTY_ITEM_SOURCE_INPUT
}

const SHOPS_FILTER = { page: 1, limit: 100, isActive: true } as const

export function ItemSourceForm(props: ItemSourceFormProps): React.JSX.Element {
  const { mode, onSubmit, onDirtyChange, isPending, disabledShopIds } = props
  const t = useTranslate()
  const isEdit = mode === 'edit'
  const shopsQuery = useAdminShops(SHOPS_FILTER)
  const shops = shopsQuery.data?.items ?? []

  const form = useForm<ItemSourceFormValues>({
    resolver: zodResolver(itemSourceInputSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: buildDefaultValues(props),
  })

  const values = form.watch()
  const isFormValid = itemSourceInputSchema.safeParse(values).success
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
        <ItemSourceFields<ItemSourceFormValues>
          namePrefix=""
          shops={shops}
          isShopsLoading={shopsQuery.isLoading}
          disabled={isPending}
          disabledShopIds={disabledShopIds}
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
