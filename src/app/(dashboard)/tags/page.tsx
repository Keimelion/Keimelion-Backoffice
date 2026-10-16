import { Suspense } from 'react'
import { TranslatedPageHeader } from '@/components/shared/translated-page-header'
import { TagsPageContent } from '@/features/tags/components/tags-page-content'

export default function TagsPage(): React.JSX.Element {
  return (
    <>
      <TranslatedPageHeader namespace="tags.list" />
      <Suspense>
        <TagsPageContent />
      </Suspense>
    </>
  )
}
