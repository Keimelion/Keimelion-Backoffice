'use client'

import { useIntl } from 'react-intl'
import { PageHeader } from '@/components/shared/page-header'

interface TranslatedPageHeaderProps {
  titleId: string
  descriptionId: string
  actions?: React.ReactNode
}

export function TranslatedPageHeader({
  titleId,
  descriptionId,
  actions,
}: TranslatedPageHeaderProps): React.JSX.Element {
  const intl = useIntl()
  return (
    <PageHeader
      title={intl.formatMessage({ id: titleId })}
      description={intl.formatMessage({ id: descriptionId })}
      actions={actions}
    />
  )
}
