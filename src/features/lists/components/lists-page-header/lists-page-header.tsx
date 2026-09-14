'use client'

import { useIntl } from 'react-intl'
import { PageHeader } from '@/components/shared/page-header'

export function ListsPageHeader(): React.JSX.Element {
  const intl = useIntl()
  return (
    <PageHeader
      title={intl.formatMessage({ id: 'lists.title' })}
      description={intl.formatMessage({ id: 'lists.description' })}
    />
  )
}
