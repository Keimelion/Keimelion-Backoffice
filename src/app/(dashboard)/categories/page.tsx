import { Suspense } from 'react'
import { TranslatedPageHeader } from '@/components/shared/translated-page-header'
import { CategoriesPageContent } from '@/features/categories/components/categories-page-content'

export default function CategoriesPage(): React.JSX.Element {
  return (
    <>
      <TranslatedPageHeader namespace="categories.list" />
      <Suspense>
        <CategoriesPageContent />
      </Suspense>
    </>
  )
}
