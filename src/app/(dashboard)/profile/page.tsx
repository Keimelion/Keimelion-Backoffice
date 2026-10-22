import { TranslatedPageHeader } from '@/components/shared/translated-page-header'
import { ProfilePageContent } from '@/features/profile/components/profile-page-content'

export default function ProfilePage(): React.JSX.Element {
  return (
    <>
      <TranslatedPageHeader namespace="profile" />
      <ProfilePageContent />
    </>
  )
}
