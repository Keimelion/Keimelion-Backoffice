import { Suspense } from 'react'
import { UsersPageHeader } from '@/features/users/components/users-page-header'
import { UsersPageContent } from '@/features/users/components/users-page-content'

export default function UsersPage(): React.JSX.Element {
  return (
    <>
      <UsersPageHeader />
      <Suspense>
        <UsersPageContent />
      </Suspense>
    </>
  )
}
