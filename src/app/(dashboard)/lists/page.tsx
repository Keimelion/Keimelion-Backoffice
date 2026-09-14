'use client'

import { useIntl } from 'react-intl'

export default function ListsPage(): React.JSX.Element {
  const intl = useIntl()
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {intl.formatMessage({ id: 'lists.title' })}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {intl.formatMessage({ id: 'lists.description' })}
      </p>
    </div>
  )
}
