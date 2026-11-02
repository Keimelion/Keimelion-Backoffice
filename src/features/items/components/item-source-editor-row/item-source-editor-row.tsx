'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import {
  itemSourceInputSchema,
  type ItemSourceInput,
  type ItemSourceShop,
} from '@/data-access/items/item-sources.schemas'
import { ItemSourceFields } from '@/features/items/components/item-source-fields'
import { ItemSourceEditorRowShell } from './item-source-editor-row-shell'
import { useTranslate } from '@/lib/i18n/use-translate'

interface ItemSourceEditorRowProps {
  title: string
  defaultValues: ItemSourceInput
  shops: readonly ItemSourceShop[]
  isShopsLoading: boolean
  disabledShopIds: ReadonlySet<string> | undefined
  isPending: boolean
  canRemove: boolean
  removeLabel: string
  rootError: string | null
  onValidate: (values: ItemSourceInput) => void
  onRemove: () => void
}

export function ItemSourceEditorRow({
  title,
  defaultValues,
  shops,
  isShopsLoading,
  disabledShopIds,
  isPending,
  canRemove,
  removeLabel,
  rootError,
  onValidate,
  onRemove,
}: ItemSourceEditorRowProps): React.JSX.Element {
  const t = useTranslate()
  const form = useForm<ItemSourceInput>({
    resolver: zodResolver(itemSourceInputSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues,
  })

  useEffect(() => {
    if (rootError === null) {
      form.clearErrors('root')
      return
    }
    form.setError('root', { message: rootError })
  }, [form, rootError])

  const values = form.watch()
  const isFormValid = itemSourceInputSchema.safeParse(values).success
  const canValidate = isFormValid && !isPending

  return (
    <ItemSourceEditorRowShell
      title={title}
      canRemove={canRemove}
      isPending={isPending}
      removeLabel={removeLabel}
      onRemove={onRemove}
    >
      <Form {...form}>
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            void form.handleSubmit((submitted) => {
              onValidate(submitted)
            })(event)
          }}
          noValidate
        >
          <ItemSourceFields<ItemSourceInput>
            namePrefix=""
            shops={shops}
            isShopsLoading={isShopsLoading}
            disabled={isPending}
            disabledShopIds={disabledShopIds}
          />

          {form.formState.errors.root ? (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.root.message}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={!canValidate}>
              {isPending
                ? t('items.form.submit_pending')
                : t('items.form.source_validate_button')}
            </Button>
          </div>
        </form>
      </Form>
    </ItemSourceEditorRowShell>
  )
}
