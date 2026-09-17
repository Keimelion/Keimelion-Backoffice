import { Suspense } from 'react'
import { TranslatedPageHeader } from '@/components/shared/translated-page-header'
import { OccasionTypesPageContent } from '@/features/occasion-types/components/occasion-types-page-content'

export default function OccasionTypesPage(): React.JSX.Element {
  return (
    <>
      <TranslatedPageHeader namespace="occasion_types.list" />
      <Suspense>
        <OccasionTypesPageContent />
      </Suspense>
    </>
  )
}
