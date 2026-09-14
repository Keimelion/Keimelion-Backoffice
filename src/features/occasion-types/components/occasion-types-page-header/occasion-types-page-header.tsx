'use client'

import { useIntl } from 'react-intl'
import { PageHeader } from '@/components/shared/page-header'

export function OccasionTypesPageHeader(): React.JSX.Element {
  const intl = useIntl()
  return (
    <PageHeader
      title={intl.formatMessage({ id: 'occasion_types.list.title' })}
      description={intl.formatMessage({ id: 'occasion_types.list.description' })}
    />
  )
}
