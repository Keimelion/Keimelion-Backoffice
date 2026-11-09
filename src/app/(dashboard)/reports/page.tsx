import { Suspense } from 'react'
import { TranslatedPageHeader } from '@/components/shared/translated-page-header'
import { ReportsPageContent } from '@/features/reports/components/reports-page-content'

export default function ReportsPage(): React.JSX.Element {
  return (
    <>
      <TranslatedPageHeader namespace="reports.list" />
      <Suspense>
        <ReportsPageContent />
      </Suspense>
    </>
  )
}
