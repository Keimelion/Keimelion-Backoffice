import { Suspense } from 'react'
import { TranslatedPageHeader } from '@/components/shared/translated-page-header'
import { UsersPageContent } from '@/features/users/components/users-page-content'

export default function UsersPage(): React.JSX.Element {
  return (
    <>
      <TranslatedPageHeader titleId="users.list.title" descriptionId="users.list.description" />
      <Suspense>
        <UsersPageContent />
      </Suspense>
    </>
  )
}
