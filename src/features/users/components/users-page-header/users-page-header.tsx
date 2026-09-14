'use client'

import { useIntl } from 'react-intl'
import { PageHeader } from '@/components/shared/page-header'

export function UsersPageHeader(): React.JSX.Element {
  const intl = useIntl()
  return (
    <PageHeader
      title={intl.formatMessage({ id: 'users.list.title' })}
      description={intl.formatMessage({ id: 'users.list.description' })}
    />
  )
}
