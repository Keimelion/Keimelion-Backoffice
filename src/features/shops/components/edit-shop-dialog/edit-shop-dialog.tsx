'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { HttpStatus } from '@keimelion/sdk/enums'
import { FormDialog } from '@/components/shared/form-dialog'
import { ShopForm } from '@/features/shops/components/shop-form'
import type { ShopFormValues } from '@/features/shops/components/shop-form'
import { useUpdateShop } from '@/features/shops/hooks/use-admin-shops'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { pickChangedFields } from '@/lib/pick-changed-fields'
import { useTranslate } from '@/lib/i18n/use-translate'
import { ApiError } from '@keimelion/sdk/client'
import type { ShopDetailParsed } from '@keimelion/sdk/schemas'

interface EditShopDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shop: ShopDetailParsed
}

const EDITABLE_SHOP_FIELDS = ['name', 'domain', 'logoUrl', 'isAffiliated', 'sortOrder', 'isActive'] as const satisfies readonly (keyof ShopFormValues)[]

export function EditShopDialog({
  open,
  onOpenChange,
  shop,
}: EditShopDialogProps): React.JSX.Element {
  const t = useTranslate()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)
  const mutation = useUpdateShop()

  function handleSubmit(
    values: ShopFormValues,
    setError: UseFormSetError<ShopFormValues>,
  ): void {
    mutation.mutate(
      { id: shop.id, input: pickChangedFields(shop, values, EDITABLE_SHOP_FIELDS) },
      {
        onSuccess: () => {
          notifySuccess({ title: translate('shops.mutation.updated_toast', { name: values.name }) })
          onOpenChange(false)
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === HttpStatus.CONFLICT) {
            setError('domain', { message: t('shops.form.error.domain_conflict') })
            return
          }
          setError('root', { message: error.message })
        },
      },
    )
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('shops.admin.edit_dialog_title')}
      isFormDirty={isFormDirty}
    >
      <ShopForm
        mode="edit"
        shop={shop}
        onSubmit={handleSubmit}
        onDirtyChange={setIsFormDirty}
        isPending={mutation.isPending}
      />
    </FormDialog>
  )
}
