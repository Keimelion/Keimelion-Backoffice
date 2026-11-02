'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { FormDialog } from '@/components/shared/form-dialog'
import { ShopForm } from '@/features/shops/components/shop-form'
import type { ShopFormValues } from '@/features/shops/components/shop-form'
import { useCreateShop } from '@/features/shops/hooks/use-admin-shops'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { useTranslate } from '@/lib/i18n/use-translate'

interface CreateShopDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function isDomainConflictMessage(message: string): boolean {
  return /domain/i.test(message)
}

export function CreateShopDialog({
  open,
  onOpenChange,
}: CreateShopDialogProps): React.JSX.Element {
  const t = useTranslate()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)
  const mutation = useCreateShop()

  function handleSubmit(
    values: ShopFormValues,
    setError: UseFormSetError<ShopFormValues>,
  ): void {
    mutation.mutate(values, {
      onSuccess: () => {
        notifySuccess({ title: translate('shops.mutation.created_toast', { name: values.name }) })
        onOpenChange(false)
      },
      onError: (error) => {
        if (error instanceof ApiRequestError && error.status === HttpStatus.CONFLICT) {
          if (isDomainConflictMessage(error.message)) {
            setError('domain', { message: t('shops.form.error.domain_conflict') })
            return
          }
          setError('slug', { message: t('shops.form.error.slug_conflict') })
          return
        }
        setError('root', { message: error.message })
      },
    })
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('shops.admin.create_dialog_title')}
      isFormDirty={isFormDirty}
    >
      <ShopForm
        mode="create"
        onSubmit={handleSubmit}
        onDirtyChange={setIsFormDirty}
        isPending={mutation.isPending}
      />
    </FormDialog>
  )
}
