'use client'

import { TranslatedConfirmDialog } from '@/components/shared/translated-confirm-dialog'
import { useDeleteShop } from '@/features/shops/hooks/use-admin-shops'
import type { AdminShop } from '@/data-access/shops/admin-shops.schemas'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'

interface DeleteShopDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shop: AdminShop
}

export function DeleteShopDialog({
  open,
  onOpenChange,
  shop,
}: DeleteShopDialogProps): React.JSX.Element {
  const mutation = useDeleteShop()

  async function handleConfirm(): Promise<void> {
    await mutation.mutateAsync(shop.id)
    notifySuccess({ title: translate('shops.mutation.deleted_toast', { name: shop.name }) })
    onOpenChange(false)
  }

  return (
    <TranslatedConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      namespace="shops.admin.delete_dialog"
      values={{ name: shop.name }}
      onConfirm={handleConfirm}
      destructive
    />
  )
}
