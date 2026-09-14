'use client'

import { useIntl } from 'react-intl'
import { PageHeader } from '@/components/shared/page-header'

export function DashboardPageHeader(): React.JSX.Element {
  const intl = useIntl()
  return (
    <PageHeader
      title={intl.formatMessage({ id: 'dashboard.title' })}
      description={intl.formatMessage({ id: 'dashboard.description' })}
    />
  )
}
