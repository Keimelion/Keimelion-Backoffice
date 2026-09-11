import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { UsersPageContent } from '@/features/users/components/users-page-content'

export default function UsersPage(): React.JSX.Element {
  return (
    <>
      <PageHeader
        title="Users"
        description="Accounts registered on Keimelion."
      />
      <Suspense>
        <UsersPageContent />
      </Suspense>
    </>
  )
}
