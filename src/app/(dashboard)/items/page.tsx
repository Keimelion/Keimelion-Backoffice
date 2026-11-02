import { Suspense } from 'react'
import { TranslatedPageHeader } from '@/components/shared/translated-page-header'
import { ItemsPageContent } from '@/features/items/components/items-page-content'

export default function ItemsPage(): React.JSX.Element {
  return (
    <>
      <TranslatedPageHeader namespace="items.list" />
      <Suspense>
        <ItemsPageContent />
      </Suspense>
    </>
  )
}
