'use client'

import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import type { MessageId } from '@/lib/i18n/messages/en'
import { useTranslate } from '@/lib/i18n/use-translate'

type NamespaceOf<Suffix extends string, Id extends string> =
  Id extends `${infer Namespace}.${Suffix}` ? Namespace : never

type NamespaceWithTitle = NamespaceOf<'title', Extract<MessageId, `${string}.title`>>
type NamespaceWithDescription = NamespaceOf<'description', Extract<MessageId, `${string}.description`>>
type NamespaceWithConfirm = NamespaceOf<'confirm', Extract<MessageId, `${string}.confirm`>>
type NamespaceWithCancel = NamespaceOf<'cancel', Extract<MessageId, `${string}.cancel`>>

// eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents -- each constituent enforces a distinct required suffix; the intersection is intentional and stays sound as new namespaces are added
export type ConfirmDialogNamespace = NamespaceWithTitle & NamespaceWithDescription & NamespaceWithConfirm & NamespaceWithCancel

interface TranslatedConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  namespace: ConfirmDialogNamespace
  values?: Record<string, string | number>
  onConfirm: () => void | Promise<void>
  destructive?: boolean
}

export function TranslatedConfirmDialog({
  open,
  onOpenChange,
  namespace,
  values,
  onConfirm,
  destructive,
}: TranslatedConfirmDialogProps): React.JSX.Element {
  const t = useTranslate()
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t(`${namespace}.title`)}
      description={t(`${namespace}.description`, values)}
      confirmLabel={t(`${namespace}.confirm`, values)}
      cancelLabel={t(`${namespace}.cancel`, values)}
      onConfirm={onConfirm}
      destructive={destructive ?? false}
    />
  )
}
