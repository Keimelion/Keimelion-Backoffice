'use client'

import { PageHeader } from '@/components/shared/page-header'
import type { MessageId } from '@/lib/i18n/messages/en'
import { useTranslate } from '@/lib/i18n/use-translate'

type NamespaceOf<Suffix extends string, Id extends string> =
  Id extends `${infer Namespace}.${Suffix}` ? Namespace : never

type NamespaceWithTitle = NamespaceOf<'title', Extract<MessageId, `${string}.title`>>
type NamespaceWithDescription = NamespaceOf<'description', Extract<MessageId, `${string}.description`>>

export type PageHeaderNamespace = NamespaceWithTitle & NamespaceWithDescription

interface TranslatedPageHeaderProps {
  namespace: PageHeaderNamespace
  actions?: React.ReactNode
}

export function TranslatedPageHeader({
  namespace,
  actions,
}: TranslatedPageHeaderProps): React.JSX.Element {
  const t = useTranslate()
  return (
    <PageHeader
      title={t(`${namespace}.title`)}
      description={t(`${namespace}.description`)}
      actions={actions}
    />
  )
}
