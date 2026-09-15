'use client'

import { useIntl } from 'react-intl'
import { PageHeader } from '@/components/shared/page-header'
import type { MessageId } from '@/lib/i18n/messages/en'

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
  const intl = useIntl()
  return (
    <PageHeader
      title={intl.formatMessage({ id: `${namespace}.title` })}
      description={intl.formatMessage({ id: `${namespace}.description` })}
      actions={actions}
    />
  )
}
