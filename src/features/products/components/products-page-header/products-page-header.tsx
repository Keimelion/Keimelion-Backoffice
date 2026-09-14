'use client'

import { useIntl } from 'react-intl'
import { PageHeader } from '@/components/shared/page-header'

export function ProductsPageHeader(): React.JSX.Element {
  const intl = useIntl()
  return (
    <PageHeader
      title={intl.formatMessage({ id: 'products.title' })}
      description={intl.formatMessage({ id: 'products.description' })}
    />
  )
}
