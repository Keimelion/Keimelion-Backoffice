'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeleteCategory } from '@/features/categories/hooks/use-admin-categories'
import { resolveCategoryName } from '@/features/categories/lib/resolve-category-name'
import type { ApiCategory } from '@/data-access/categories/categories.schemas'
import { useLocaleStore } from '@/lib/i18n/locale-store'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { useTranslate } from '@/lib/i18n/use-translate'
import { cn } from '@/lib/utils'

interface DeleteCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: ApiCategory
  descendantCount: number
}

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
  descendantCount,
}: DeleteCategoryDialogProps): React.JSX.Element {
  const t = useTranslate()
  const locale = useLocaleStore((state) => state.locale)
  const [isPending, setIsPending] = useState<boolean>(false)
  const mutation = useDeleteCategory()
  const resolvedName = resolveCategoryName(category, locale)

  async function handleConfirm(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    event.preventDefault()
    setIsPending(true)
    try {
      await mutation.mutateAsync(category.id)
      notifySuccess({
        title: translate('categories.mutation.deleted_toast', { name: resolvedName }),
      })
      onOpenChange(false)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('categories.admin.delete_dialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('categories.admin.delete_dialog.description', { name: resolvedName })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {descendantCount > 0 ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              {t('categories.admin.delete_dialog.cascade_warning', {
                name: resolvedName,
                count: descendantCount,
              })}
            </p>
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {t('categories.admin.delete_dialog.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: 'destructive' }))}
            onClick={(event) => { void handleConfirm(event) }}
            disabled={isPending}
          >
            {t('categories.admin.delete_dialog.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
