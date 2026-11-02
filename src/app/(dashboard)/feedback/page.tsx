import { Suspense } from 'react'
import { TranslatedPageHeader } from '@/components/shared/translated-page-header'
import { FeedbackPageContent } from '@/features/feedback/components/feedback-page-content'

export default function FeedbackPage(): React.JSX.Element {
  return (
    <>
      <TranslatedPageHeader namespace="feedback.list" />
      <Suspense>
        <FeedbackPageContent />
      </Suspense>
    </>
  )
}
