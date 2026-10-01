import { Suspense } from 'react'
import { TranslatedPageHeader } from '@/components/shared/translated-page-header'
import { ShopsPageContent } from '@/features/shops/components/shops-page-content'

export default function ShopsPage(): React.JSX.Element {
  return (
    <>
      <TranslatedPageHeader namespace="shops.list" />
      <Suspense>
        <ShopsPageContent />
      </Suspense>
    </>
  )
}
