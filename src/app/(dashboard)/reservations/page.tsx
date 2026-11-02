import { Suspense } from 'react'
import { TranslatedPageHeader } from '@/components/shared/translated-page-header'
import { ReservationsPageContent } from '@/features/reservations/components/reservations-page-content'

export default function ReservationsPage(): React.JSX.Element {
  return (
    <>
      <TranslatedPageHeader namespace="reservations.list" />
      <Suspense>
        <ReservationsPageContent />
      </Suspense>
    </>
  )
}
