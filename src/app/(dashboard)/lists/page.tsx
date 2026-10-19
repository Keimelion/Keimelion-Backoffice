import { Suspense } from 'react'
import { TranslatedPageHeader } from '@/components/shared/translated-page-header'
import { ListsPageContent } from '@/features/lists/components/lists-page-content'

export default function ListsPage(): React.JSX.Element {
  return (
    <>
      <TranslatedPageHeader namespace="lists.list" />
      <Suspense>
        <ListsPageContent />
      </Suspense>
    </>
  )
}
